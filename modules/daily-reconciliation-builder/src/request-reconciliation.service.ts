import { DataService } from './data.service';
import { RequestService } from './request.service';
import type { DataBuilderInterface } from './types/data-builder.interface';
import type { RequestBuilderInterface } from './types/request-builder-interface';
import { DailyReconciliationContract } from '@pressingly-modules/event-contract/src/contract/daily-reconciliation/daily-reconciliation.contract';
import { DailyReconciliationContractPayload } from '@pressingly-modules/event-contract/src/contract/daily-reconciliation/daily-reconciliation.contract-payload';
import { v4 as uuidv4 } from 'uuid';
import { DailyReconciliationRequestPinetEvent } from '@pressingly-modules/event-contract/src/events/daily-reconciliation-request.pinet-event';
import type { PrivateKeyInterface, PublicKeyInterface } from './types/key.interface';
import type { ReconciliationBuilderInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-builder.interface';
import * as dayjs from 'dayjs';
import { DailyReconciliationStatus } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation.interface';

export interface RequestReconciliationServiceConfigs {
  dataBuilder: DataBuilderInterface;
  requestBuilder: RequestBuilderInterface;
  reconciliationBuilder: ReconciliationBuilderInterface;
  key: PrivateKeyInterface;
  partnerKey: PublicKeyInterface;
  partnerId: string;
  id: string;
  date?: Date;
  isPrimary?: boolean;
}

export class RequestReconciliationService {
  private readonly dataService: DataService;
  private readonly requestService: RequestService;
  private readonly reconciliationBuilder: ReconciliationBuilderInterface;
  private readonly key: PrivateKeyInterface;
  private readonly partnerKey: PublicKeyInterface;
  private readonly id: string;
  private readonly partnerId: string;
  private readonly date: dayjs.Dayjs;
  // Todo: restrict this isPrimary logic: 2 services should not be primary at the same time
  private readonly isPrimary: boolean;

  // Not allow to new instance directly, should use static method create, for async constructor
  private constructor(configs: RequestReconciliationServiceConfigs) {
    this.id = configs.id;
    this.partnerId = configs.partnerId;
    this.date = configs.date ? dayjs(configs.date) : dayjs();
    this.key = configs.key;
    this.partnerKey = configs.partnerKey;
    this.isPrimary = configs.isPrimary ?? false;
    this.dataService = new DataService({
      dataBuilder: configs.dataBuilder,
      reconciliationBuilder: configs.reconciliationBuilder,
      key: this.key,
      partnerKey: this.partnerKey,
      date: this.date,
      partnerId: this.partnerId,
      isPrimary: this.isPrimary,
    });
    this.requestService = new RequestService({
      requestBuilder: configs.requestBuilder,
      date: this.date,
      id: this.id,
      partnerId: this.partnerId,
      partnerKid: this.partnerKey.kid,
    });
    this.reconciliationBuilder = configs.reconciliationBuilder;
  }

  static async create(configs: Omit<RequestReconciliationServiceConfigs, 'partnerKey'>) {
    const partnerKey = await configs.requestBuilder.getPartnerPublicKey(configs.partnerId);

    return new RequestReconciliationService({
      ...configs,
      partnerKey,
    });
  }

  async execute() {
    const reconciliationId = uuidv4();

    // build own data
    await this.dataService.loadOwnData();

    const encryptedPartnerData = await this.requestService.download();
    if (encryptedPartnerData) {
      await this.dataService.loadPartnerData(encryptedPartnerData);

      if (!(await this.dataService.compareData(reconciliationId))) {
        // resolve conflict, automatically or manually, for now only automatically
        // Todo: should break the process and wait for user action if manually
        // after resolve, should update own data if needed (in another resolving process)
        // reinit RequestReconciliationService, then call execute => compareData should be true
        // if compareData not true, should resolve conflict manually again
        const isResolvedConflict = await this.dataService.resolveConflict();
        if (!isResolvedConflict) {
          return;
        }

        // rebuild own data
        await this.dataService.loadOwnData();
      }
    }
    // encrypt and upload data to s3 via monetaService
    const encryptedOwnData = await this.dataService.encryptOwnData();
    const attachmentId = await this.requestService.upload(encryptedOwnData);

    // init daily-daily-reconciliation-builder contracts
    // sign contracts
    const iat = dayjs();
    const contractPayload = new DailyReconciliationContractPayload({
      iss: this.id,
      aud: this.partnerId,
      iat: iat.unix(),
      exp: iat.add(30, 'minutes').unix(),
      // Todo: what is sub here?
      sub: this.partnerId,
      contractId: reconciliationId,
      stats: this.dataService.data.statsDataset,
      date: this.date.toISOString(),
      // Todo: ensure fileId later
      // fileId: attachmentId,
    });
    const contract = new DailyReconciliationContract(contractPayload);
    await contract.sign(this.key.privateKey, {}, { kid: this.key.kid });

    await this.reconciliationBuilder.upsertReconciliation({
      id: reconciliationId,
      contract: contract.data,
      partnerId: this.partnerId,
      attachmentId,
      date: this.date.toDate(),
      status: DailyReconciliationStatus.PROCESSING,
      totalAmount: this.dataService.data.statsDataset.totalSubscriptionChargeAmount,
      totalInterchangeFee: this.dataService.data.statsDataset.totalInterchangeFee,
      // TODO: define currency code later
      currencyCode: this.dataService.data.subscriptionChargeDataset[0]?.currency ?? 'USD',
      issuedAt: iat.toDate(),
    });

    const event = new DailyReconciliationRequestPinetEvent({
      payload: {
        contract: contract.data,
      },
    });
    try {
      const sendEventRes = await this.requestService.send(event);
      await this.reconciliationBuilder.upsertReconciliation({
        id: reconciliationId,
        contract: sendEventRes.contract,
      });
    } catch (error) {
      await this.reconciliationBuilder.upsertReconciliation({
        id: reconciliationId,
        status: DailyReconciliationStatus.FAILED,
        message: 'Failed to send event',
      });
    }
  }
}
