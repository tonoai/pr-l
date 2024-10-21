import { PrinvateKeyInterface, PublicKeyInterface } from './types/key.interface';
import { RequestService } from './request.service';
import { DataService } from './data.service';
import { DataBuilderInterface } from './types/data-builder.interface';
import { RequestBuilderInterface } from './types/request-builder-interface';
import { RawContract } from './events/base-event';
import { DailyReconciliationContract } from './contracts/daily-reconciliation.contract';
import {
  DailyReconciliationContractPayload,
  DailyReconciliationResponseProtectedHeader,
} from './contracts/daily-reconciliation.contract-payload';
import { DailyReconciliationResponseEvent } from './events/daily-reconciliation-response.event';

export interface ResolveReconciliationServiceConfigs {
  dataBuilder: DataBuilderInterface;
  requestBuilder: RequestBuilderInterface;
  myKey: PrinvateKeyInterface;
  // Todo: move this input to this service
  partnerKey: PublicKeyInterface;
  partnerId: string;
  requestContract: RawContract;
  myId: string;
  date?: Date;
}
export class ResolveReconciliationService {
  private dataService: DataService;
  private requestService: RequestService;
  private myKey: PrinvateKeyInterface;
  private partnerKey: PublicKeyInterface;
  private myId: string;
  private partnerId: string;
  private date: Date;
  private requestContract: DailyReconciliationContract;

  constructor(configs: ResolveReconciliationServiceConfigs) {
    this.myId = configs.myId;
    this.partnerId = configs.partnerId;
    this.date = configs.date ?? new Date();
    this.myKey = configs.myKey;
    this.partnerKey = configs.partnerKey;
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
    });
    this.requestContract = new DailyReconciliationContract().fromJWS(configs.requestContract);
    // Todo: should handle request event here or only contract?
  }

  async execute() {
    // validate event or contract
    // failed - return fail with error
    // Todo: update contract to verify some signature (not all)
    // because the contract still not have all signatures
    try {
      await this.requestContract.transformAndValidate(
        DailyReconciliationContractPayload,
        this.requestService.getPublicKeyByKid,
      );
    } catch (err) {
      return this.signContractAndSendEvent({
        status: 'failed',
        // Todo: should be more specific error
        message: err,
      });
    }
    // download data from partner
    const { data, kid } = await this.requestService.download();
    if (kid !== this.myKey.kid) {
      // for now only use one key for publisher and membership
      throw new Error('Invalid encrypted kid');
    }
    // decrypt data and inject to service
    await this.dataService.loadPartnerData(data);
    // build own data
    await this.dataService.loadOwnData();
    if (this.dataService.compareData()) {
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
    // upload data to s3 via monetaService
    await this.requestService.upload(data);

    return this.signContractAndSendEvent({
      status: 'reconciled',
    });
  }

  private async signContractAndSendEvent(
    protectedHeader: DailyReconciliationResponseProtectedHeader,
  ) {
    // Todo create reconciliation record with contracts data
    // await this.dataService.createReconciliationRecord();
    await this.requestContract.sign(this.myKey.privateKey, protectedHeader, {
      kid: this.myKey.kid,
    });

    // init moneta event with contracts data
    const event = new DailyReconciliationResponseEvent({
      payload: {
        contract: this.requestContract.data,
      },
    });
    // send reconciliation request to monetaService
    await this.requestService.send(event);
  }
}
