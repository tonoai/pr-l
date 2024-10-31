import type { PrivateKeyInterface, PublicKeyInterface } from './types/key.interface';
import { RequestService } from './request.service';
import { DataService } from './data.service';
import type { DataBuilderInterface } from './types/data-builder.interface';
import type { RequestBuilderInterface } from './types/request-builder-interface';
import { DailyReconciliationContract } from '@pressingly-modules/event-contract/src/contract/daily-reconciliation/daily-reconciliation.contract';
import type { DailyReconciliationResolveProtectedHeader } from '@pressingly-modules/event-contract/src/contract/daily-reconciliation/daily-reconciliation.contract-payload';
import {
  DailyReconciliationContractPayload,
  DailyReconciliationResolveStatus,
} from '@pressingly-modules/event-contract/src/contract/daily-reconciliation/daily-reconciliation.contract-payload';
import { DailyReconciliationResponseEvent } from '../../event-contract/src/events/daily-reconciliation-response.event';
import type { PinetContract } from '@pressingly-modules/event-contract/src/events/pinet-event';
import type { ReconciliationBuilderInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-builder.interface';

export interface ResolveReconciliationServiceConfigs {
  dataBuilder: DataBuilderInterface;
  requestBuilder: RequestBuilderInterface;
  reconciliationBuilder: ReconciliationBuilderInterface;
  key: PrivateKeyInterface;
  partnerKey: PublicKeyInterface;
  partnerId: string;
  id: string;
  requestContract: PinetContract;
}

export class ResolveReconciliationService {
  private readonly dataService: DataService;
  private readonly requestService: RequestService;
  private readonly reconciliationBuilder: ReconciliationBuilderInterface;
  private readonly key: PrivateKeyInterface;
  private readonly partnerKey: PublicKeyInterface;
  private readonly id: string;
  private readonly partnerId: string;
  private readonly date: Date;
  private readonly requestContract: DailyReconciliationContract;
  private readonly requestContractPayload: DailyReconciliationContractPayload;

  private constructor(configs: ResolveReconciliationServiceConfigs) {
    this.id = configs.id;
    this.partnerId = configs.partnerId;
    this.key = configs.key;
    this.partnerKey = configs.partnerKey;
    this.requestContract = new DailyReconciliationContract().fromJWS(configs.requestContract);
    this.requestContractPayload = this.requestContract.getPayload();
    this.date = new Date(this.requestContractPayload.date);
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

  static async create(configs: Omit<ResolveReconciliationServiceConfigs, 'partnerKey'>) {
    const partnerKey = await configs.requestBuilder.getPartnerPublicKey(configs.partnerId);

    return new ResolveReconciliationService({
      ...configs,
      partnerKey,
    });
  }

  async execute() {
    await this.reconciliationBuilder.upsertReconciliation({
      id: this.requestContractPayload.contractId,
      date: this.date,
      partnerId: this.partnerId,
      status: 'pending',
      contract: this.requestContract.data,
    });
    try {
      await this.requestContract.transformAndValidate(DailyReconciliationContractPayload);
      await this.requestContract.verifySomeSignatures(2, [
        this.requestService.requestBuilder.getPublicKey,
        this.requestService.requestBuilder.getPinetCorePublicKey,
      ]);
    } catch (err) {
      return this.signContractAndSendEvent({
        status: DailyReconciliationResolveStatus.FAILED,
        // Todo: should be more specific error
        message: 'Verifying contract failed',
      });
    }
    // download data from partner
    const encryptedPartnerData = await this.requestService.download();
    if (!encryptedPartnerData) {
      return this.signContractAndSendEvent({
        status: DailyReconciliationResolveStatus.FAILED,
        message: 'Failed to download partner data',
      });
    }
    try {
      // decrypt data and inject to service
      await this.dataService.loadPartnerData(encryptedPartnerData);
    } catch (err) {
      // TOdo: store the daily-daily-reconciliation-builder record with failed status
      return this.signContractAndSendEvent({
        status: DailyReconciliationResolveStatus.FAILED,
        message: 'Failed to decrypt partner data',
      });
    }
    // TOdo, upload data after resolve conflict
    await this.dataService.loadOwnData();
    const encryptedOwnData = await this.dataService.encryptOwnData();
    // upload data to s3 via monetaService
    await this.requestService.upload(encryptedOwnData);

    // build own data
    if (!this.dataService.compareData()) {
      // resolve conflict, automatically or manually, for now only automatically
      // Todo: should break the process and wait for user action if manually
      // after resolve, should update own data if needed (in another resolving process)
      // reinit RequestReconciliationService, then call execute => compareData should be true
      // if compareData not true, should resolve conflict manually again
      const isResolvedConflict = await this.dataService.resolveConflict();
      if (isResolvedConflict) {
        // TOdo: what happen if conflict resolve?
        // send contract with status resolved?
        // but partner data is not updated yet
        // and partner may not allow to update their data
        return;
      } else {
        return this.signContractAndSendEvent({
          status: DailyReconciliationResolveStatus.MISMATCHED,
          message: 'Data mismatch',
        });
      }
    }

    return this.signContractAndSendEvent({
      status: DailyReconciliationResolveStatus.RECONCILED,
    });
  }

  private async signContractAndSendEvent(
    protectedHeader: DailyReconciliationResolveProtectedHeader,
  ) {
    await this.requestContract.sign(this.key.privateKey, protectedHeader, {
      kid: this.key.kid,
    });
    await this.reconciliationBuilder.upsertReconciliation({
      id: this.requestContractPayload.contractId,
      status: protectedHeader.status,
      contract: this.requestContract.data,
    });

    // init moneta event with contracts data
    const event = new DailyReconciliationResponseEvent({
      payload: {
        contract: this.requestContract.data,
      },
    });
    // send daily-daily-reconciliation-builder request to monetaService
    const sendEventRes = await this.requestService.send(event);
    await this.reconciliationBuilder.upsertReconciliation({
      id: this.requestContractPayload.contractId,
      status: protectedHeader.status,
      contract: sendEventRes.contract,
    });
  }
}
