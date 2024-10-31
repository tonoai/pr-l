import { DataService } from './data.service';
import { RequestService } from './request.service';
import type { DataBuilderInterface } from './types/data-builder.interface';
import type { RequestBuilderInterface } from './types/request-builder-interface';
import { DailyReconciliationContract } from '@pressingly-modules/event-contract/src/contract/daily-reconciliation/daily-reconciliation.contract';
import { DailyReconciliationContractPayload } from '@pressingly-modules/event-contract/src/contract/daily-reconciliation/daily-reconciliation.contract-payload';
import { v4 as uuidv4 } from 'uuid';
import { DailyReconciliationRequestEvent } from '../../event-contract/src/events/daily-reconciliation-request.event';
import type { PrivateKeyInterface, PublicKeyInterface } from './types/key.interface';
import type { ReconciliationBuilderInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-builder.interface';

export interface RequestReconciliationServiceConfigs {
  dataBuilder: DataBuilderInterface;
  requestBuilder: RequestBuilderInterface;
  reconciliationBuilder: ReconciliationBuilderInterface;
  key: PrivateKeyInterface;
  partnerKey: PublicKeyInterface;
  partnerId: string;
  id: string;
  date?: Date;
}

export class RequestReconciliationService {
  private readonly dataService: DataService;
  private readonly requestService: RequestService;
  private readonly reconciliationBuilder: ReconciliationBuilderInterface;
  private readonly key: PrivateKeyInterface;
  private readonly partnerKey: PublicKeyInterface;
  private readonly id: string;
  private readonly partnerId: string;
  private readonly date: Date;

  // Not allow to new instance directly, should use static method create, for async constructor
  private constructor(configs: RequestReconciliationServiceConfigs) {
    this.id = configs.id;
    this.partnerId = configs.partnerId;
    this.date = configs.date ?? new Date();
    this.key = configs.key;
    this.partnerKey = configs.partnerKey;
    this.dataService = new DataService({
      dataBuilder: configs.dataBuilder,
      key: this.key,
      partnerKey: this.partnerKey,
      date: this.date,
      partnerId: this.partnerId,
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
    // build own data
    await this.dataService.loadOwnData();

    // download data from partner
    const encryptedPartnerData = await this.requestService.download();
    if (encryptedPartnerData) {
      // decrypt data and inject to service
      await this.dataService.loadPartnerData(encryptedPartnerData);

      if (!this.dataService.compareData()) {
        // resolve conflict, automatically or manually, for now only automatically
        // Todo: should break the process and wait for user action if manually
        // after resolve, should update own data if needed (in another resolving process)
        // reinit RequestReconciliationService, then call execute => compareData should be true
        // if compareData not true, should resolve conflict manually again
        const isResolvedConflict = await this.dataService.resolveConflict();
        if (!isResolvedConflict) {
          return;
        }
      }
    }

    const encryptedOwnData = await this.dataService.encryptOwnData();
    // upload data to s3 via monetaService
    await this.requestService.upload(encryptedOwnData);

    // init daily-daily-reconciliation-builder contracts
    // sign contracts
    const reconciliationId = uuidv4();
    const contractPayload = new DailyReconciliationContractPayload({
      iss: this.id,
      aud: this.partnerId,
      // Todo: what is sub here?
      sub: this.partnerId,
      // Todo: should use daily-daily-reconciliation-builder record id
      contractId: reconciliationId,
      stats: this.dataService.data.statsDataset,
    });
    const contract = new DailyReconciliationContract(contractPayload);
    await contract.sign(this.key.privateKey);
    // Todo: create daily-daily-reconciliation-builder record with contracts data
    await this.reconciliationBuilder.upsertReconciliation({
      reconciliationId,
      contract: contract.data,
      partnerId: this.partnerId,
      date: this.date,
      status: 'processing',
      issuedAt: new Date(contractPayload.iat),
    });

    // init moneta event with contracts data
    const event = new DailyReconciliationRequestEvent({
      payload: {
        contract: contract.data,
      },
    });
    // send daily-daily-reconciliation-builder request to monetaService
    const sendEventRes = await this.requestService.send(event);
    await this.reconciliationBuilder.upsertReconciliation({
      reconciliationId,
      contract: sendEventRes.contract,
    });
  }
}
