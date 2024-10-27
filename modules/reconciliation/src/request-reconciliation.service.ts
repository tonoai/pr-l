import { DataService } from './data.service';
import { RequestService } from './request.service';
import { DataBuilderInterface } from './types/data-builder.interface';
import { RequestBuilderInterface } from './types/request-builder-interface';
import { DailyReconciliationContract } from '@pressingly-modules/event-contract/src/contract/contracts/daily-reconciliation/daily-reconciliation.contract';
// eslint-disable-next-line max-len
import { DailyReconciliationContractPayload } from '@pressingly-modules/event-contract/src/contract/contracts/daily-reconciliation/daily-reconciliation.contract-payload';
import { v4 as uuidv4 } from 'uuid';
import { DailyReconciliationRequestEvent } from '../../event-contract/src/events/daily-reconciliation-request.event';
import { PrinvateKeyInterface, PublicKeyInterface } from './types/key.interface';

export interface RequestReconciliationServiceConfigs {
  dataBuilder: DataBuilderInterface;
  requestBuilder: RequestBuilderInterface;
  myKey: PrinvateKeyInterface;
  partnerKey: PublicKeyInterface;
  partnerId: string;
  myId: string;
  date?: Date;
  maxRetry?: number;
  numberOfRetried?: number;
}
export class RequestReconciliationService {
  private dataService: DataService;
  private requestService: RequestService;
  private myKey: PrinvateKeyInterface;
  private partnerKey: PublicKeyInterface;
  private myId: string;
  private partnerId: string;
  private numberOfRetried: number;
  private maxRetry: number;
  private date: Date;

  // Todo: construct from response, to complete the process
  constructor(configs: RequestReconciliationServiceConfigs) {
    this.myId = configs.myId;
    this.partnerId = configs.partnerId;
    this.date = configs.date ?? new Date();
    this.myKey = configs.myKey;
    this.partnerKey = configs.partnerKey;
    this.numberOfRetried = configs.numberOfRetried ?? 0;
    this.maxRetry = configs.maxRetry ?? 1;
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
  }

  // fromResponse(response: any) {
  //   // get own myKey
  //   // get partner myKey
  //   // get dataService
  //   // get requestService
  //   // get maxRetry
  // }

  async execute() {
    // download data from partner
    const data = await this.requestService.download();
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
    // init reconciliation contracts
    // sign contracts
    const contractId = uuidv4();
    const contractPayload = new DailyReconciliationContractPayload({
      iss: this.myId,
      aud: this.partnerId,
      // Todo: what is sub here?
      sub: this.partnerId,
      // Todo: should use reconciliation record id
      contractId: contractId,
      stats: this.dataService.myData.statsDataset,
    });
    const contract = new DailyReconciliationContract(contractPayload);
    await contract.sign(this.myKey.privateKey);
    // Todo: create reconciliation record with contracts data
    // await this.dataService.createReconciliationRecord();

    // init moneta event with contracts data
    const event = new DailyReconciliationRequestEvent({
      payload: {
        contract: contract.data,
      },
    });
    // send reconciliation request to monetaService
    await this.requestService.send(event);
  }

  async handleResponse() {
    // Init resolve contracts
    // validate contracts
    // if success
    // update reconciliation record -- end first round
    // await this.dataService.updateReconciliationRecord();
    // ****
    // if failed
    // retry or not
    if (this.numberOfRetried < this.maxRetry) {
      await this.retry();
    }
  }

  async retry() {
    this.numberOfRetried++;
    // init the new reconciliation record
    // await this.dataService.createReconciliationRecord();
    // init new RequestReconciliationService
    // pull the partner data from monetaService
    // compare the data
    // if equal
    // ????
    // ***
    // if not equal
    // resolve conflict
    // re-execute with new Build own data
    await this.execute();
  }
}
