import type { PublicKeyInterface } from './types/key.interface';
import { RequestService } from './request.service';
import { DataService } from './data.service';
import { DailyReconciliationContract } from '@pressingly-modules/event-contract/src/contract/daily-reconciliation/daily-reconciliation.contract';
import type { DailyReconciliationResolveProtectedHeader } from '@pressingly-modules/event-contract/src/contract/daily-reconciliation/daily-reconciliation.contract-payload';
import {
  DailyReconciliationContractPayload,
  DailyReconciliationResolveStatus,
} from '@pressingly-modules/event-contract/src/contract/daily-reconciliation/daily-reconciliation.contract-payload';
import type { ResolveReconciliationServiceConfigs } from '@pressingly-modules/daily-reconciliation-builder/src/resolve-reconciliation.service';
import type { KeyInterface } from '@pressingly-modules/event-contract/src/contract/types/key.interface';
import { DailyReconciliationStatus } from '@pressingly-modules/daily-reconciliation/src/const/daily-reconciliation-status';
import { RequestReconciliationService } from '@pressingly-modules/daily-reconciliation-builder/src/request-reconciliation.service';
import type { ReconciliationBuilderInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-builder.interface';
import type { PinetContract } from '@pressingly-modules/event-contract/src/events/pinet-event';
import * as dayjs from 'dayjs';

export interface FinalizeReconciliationServiceConfigs extends ResolveReconciliationServiceConfigs {
  key: Required<KeyInterface>;
}

export class FinalizeReconciliationService {
  private readonly dataService: DataService;
  private readonly requestService: RequestService;
  private readonly reconciliationBuilder: ReconciliationBuilderInterface;
  private readonly key: Required<KeyInterface>;
  private readonly partnerKey: PublicKeyInterface;
  private readonly id: string;
  private readonly partnerId: string;
  private readonly date: dayjs.Dayjs;
  private readonly requestContract: DailyReconciliationContract;
  private readonly requestContractPayload: DailyReconciliationContractPayload;

  private constructor(configs: FinalizeReconciliationServiceConfigs) {
    this.id = configs.id;
    this.key = configs.key;
    this.partnerKey = configs.partnerKey;
    this.requestContract = configs.requestContract;
    this.requestContractPayload = this.requestContract.getPayload();
    this.partnerId = this.requestContractPayload.iss;
    this.date = dayjs(this.requestContractPayload.date);
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

  static async create(
    configs: Omit<FinalizeReconciliationServiceConfigs, 'partnerKey' | 'requestContract'> & {
      requestContract: PinetContract;
    },
  ) {
    const requestContract = new DailyReconciliationContract().fromJWS(configs.requestContract);
    const partnerKey = await configs.requestBuilder.getPartnerPublicKey(
      requestContract.getPayload().iss,
    );

    return new FinalizeReconciliationService({
      ...configs,
      requestContract,
      partnerKey,
    });
  }

  async execute() {
    try {
      await this.requestContract.transformAndValidate(DailyReconciliationContractPayload);
      await this.requestContract.verifyAllSignatures([
        this.key.publicKey,
        this.requestService.requestBuilder.getPublicKey,
        this.requestService.requestBuilder.getPublicKey,
        this.requestService.requestBuilder.getPinetCorePublicKey,
      ]);
    } catch (err) {
      return this.reconciliationBuilder.upsertReconciliation({
        id: this.requestContractPayload.contractId,
        status: DailyReconciliationStatus.FAILED,
        contract: this.requestContract.data,
        message: 'Verifying contract failed',
      });
    }

    const protectedHeaderResult = this.requestContract.getDecodedSignature(
      this.requestContract.partnerSignatureIndex,
    ).protectedHeader as DailyReconciliationResolveProtectedHeader;
    if (!protectedHeaderResult) {
      return this.reconciliationBuilder.upsertReconciliation({
        id: this.requestContractPayload.contractId,
        status: DailyReconciliationStatus.FAILED,
        contract: this.requestContract.data,
        message: 'No protected header found in partner signature',
      });
    }
    if (protectedHeaderResult.status === DailyReconciliationResolveStatus.RECONCILED) {
      return this.reconciliationBuilder.upsertReconciliation({
        id: this.requestContractPayload.contractId,
        status: DailyReconciliationStatus.RECONCILED,
        contract: this.requestContract.data,
        reconciledAt: dayjs.unix(protectedHeaderResult.reconciledAt!).toDate(),
      });
    }
    if (protectedHeaderResult.status === DailyReconciliationResolveStatus.FAILED) {
      const requestReconciliationService = await RequestReconciliationService.create({
        dataBuilder: this.dataService.dataBuilder,
        requestBuilder: this.requestService.requestBuilder,
        reconciliationBuilder: this.reconciliationBuilder,
        id: this.id,
        partnerId: this.partnerId,
        key: this.key,
        date: this.date.toDate(),
      });

      // no need to await here
      requestReconciliationService.execute();

      return this.reconciliationBuilder.upsertReconciliation({
        id: this.requestContractPayload.contractId,
        status: DailyReconciliationStatus.FAILED,
        contract: this.requestContract.data,
        message: 'Data mismatched',
      });
    }

    return this.reconciliationBuilder.upsertReconciliation({
      id: this.requestContractPayload.contractId,
      status: DailyReconciliationStatus.FAILED,
      contract: this.requestContract.data,
      message: protectedHeaderResult.message,
    });
  }
}
