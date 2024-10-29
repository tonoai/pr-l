import { PublicKeyInterface } from './types/key.interface';
import { RequestService } from './request.service';
import { DataService } from './data.service';
import { DailyReconciliationContract } from '@pressingly-modules/event-contract/src/contract/contracts/daily-reconciliation/daily-reconciliation.contract';
import {
  DailyReconciliationContractPayload,
  DailyReconciliationResolveProtectedHeader,
  DailyReconciliationResolveStatus,
} from '@pressingly-modules/event-contract/src/contract/contracts/daily-reconciliation/daily-reconciliation.contract-payload';
import { ResolveReconciliationServiceConfigs } from '@pressingly-modules/reconciliation-builder/src/resolve-reconciliation.service';
import { KeyInterface } from '@pressingly-modules/event-contract/src/contract/types/key.interface';
import { DailyReconciliationStatus } from '@pressingly-modules/reconciliation/const/daily-reconciliation-status';
import { RequestReconciliationService } from '@pressingly-modules/reconciliation-builder/src/request-reconciliation.service';

export interface FinalizeReconciliationServiceConfigs extends ResolveReconciliationServiceConfigs {
  myKey: Required<KeyInterface>;
}

export class FinalizeReconciliationService {
  private readonly dataService: DataService;
  private readonly requestService: RequestService;
  private readonly myKey: Required<KeyInterface>;
  private readonly partnerKey: PublicKeyInterface;
  private readonly myId: string;
  private readonly partnerId: string;
  private readonly date: Date;
  private readonly requestContract: DailyReconciliationContract;
  private readonly requestContractPayload: DailyReconciliationContractPayload;

  constructor(configs: FinalizeReconciliationServiceConfigs) {
    this.myId = configs.myId;
    this.partnerId = configs.partnerId;
    this.myKey = configs.myKey;
    this.partnerKey = configs.partnerKey;
    this.requestContract = new DailyReconciliationContract().fromJWS(configs.requestContract);
    this.requestContractPayload = this.requestContract.getPayload();
    this.date = new Date(this.requestContractPayload.date);
    this.dataService = new DataService({
      dataBuilder: configs.dataBuilder,
      myKey: this.myKey,
      partnerKey: this.partnerKey,
      date: this.date,
      partnerId: this.partnerId,
    });
    this.requestService = new RequestService({
      requestBuilder: configs.requestBuilder,
      date: this.date,
      myId: this.myId,
      partnerId: this.partnerId,
      partnerKid: this.partnerKey.kid,
    });
  }

  static async create(configs: Omit<FinalizeReconciliationServiceConfigs, 'partnerKey'>) {
    const partnerKey = await configs.requestBuilder.getPartnerPublicKey(configs.partnerId);

    return new FinalizeReconciliationService({
      ...configs,
      partnerKey,
    });
  }

  async execute() {
    try {
      await this.requestContract.transformAndValidate(DailyReconciliationContractPayload);
      await this.requestContract.verifyAllSignatures([
        this.myKey.publicKey,
        this.requestService.requestBuilder.getPublicKey,
        this.requestService.requestBuilder.getPublicKey,
        this.requestService.requestBuilder.getPinetCorePublicKey,
      ]);
    } catch (err) {
      return this.dataService.dataBuilder.updateReconciliationRecord({
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
      return this.dataService.dataBuilder.updateReconciliationRecord({
        id: this.requestContractPayload.contractId,
        status: DailyReconciliationStatus.FAILED,
        contract: this.requestContract.data,
        message: 'No protected header found in partner signature',
      });
    }
    if (protectedHeaderResult.status === DailyReconciliationResolveStatus.RECONCILED) {
      return this.dataService.dataBuilder.updateReconciliationRecord({
        id: this.requestContractPayload.contractId,
        status: DailyReconciliationStatus.RECONCILED,
        contract: this.requestContract.data,
      });
    }
    if (protectedHeaderResult.status === DailyReconciliationResolveStatus.MISMATCHED) {
      const requestReconciliationService = await RequestReconciliationService.create({
        dataBuilder: this.dataService.dataBuilder,
        requestBuilder: this.requestService.requestBuilder,
        myId: this.myId,
        partnerId: this.partnerId,
        myKey: this.myKey,
        date: this.date,
      });

      // no need to await here
      requestReconciliationService.execute();

      return this.dataService.dataBuilder.updateReconciliationRecord({
        id: this.requestContractPayload.contractId,
        status: DailyReconciliationStatus.FAILED,
        contract: this.requestContract.data,
        message: 'Data mismatched',
      });
    }

    return this.dataService.dataBuilder.updateReconciliationRecord({
      id: this.requestContractPayload.contractId,
      status: DailyReconciliationStatus.FAILED,
      contract: this.requestContract.data,
      message: protectedHeaderResult.message,
    });
  }
}
