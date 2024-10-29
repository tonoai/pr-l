import { DataService } from './data.service';
import { RequestService } from './request.service';
import { DataBuilderInterface } from './types/data-builder.interface';
import { RequestBuilderInterface } from './types/request-builder-interface';
import { DailyReconciliationContract } from '@pressingly-modules/event-contract/src/contract/contracts/daily-reconciliation/daily-reconciliation.contract';
// eslint-disable-next-line max-len
import { DailyReconciliationContractPayload } from '@pressingly-modules/event-contract/src/contract/contracts/daily-reconciliation/daily-reconciliation.contract-payload';
import { v4 as uuidv4 } from 'uuid';
import { DailyReconciliationRequestEvent } from '../../event-contract/src/events/daily-reconciliation-request.event';
import { PrivateKeyInterface, PublicKeyInterface } from './types/key.interface';

export interface RequestReconciliationServiceConfigs {
  dataBuilder: DataBuilderInterface;
  requestBuilder: RequestBuilderInterface;
  myKey: PrivateKeyInterface;
  partnerKey: PublicKeyInterface;
  partnerId: string;
  myId: string;
  date?: Date;
}
export class RequestReconciliationService {
  private readonly dataService: DataService;
  private readonly requestService: RequestService;
  private readonly myKey: PrivateKeyInterface;
  private readonly partnerKey: PublicKeyInterface;
  private readonly myId: string;
  private readonly partnerId: string;
  private readonly date: Date;

  // Not allow to new instance directly, should use static method create, for async constructor
  private constructor(configs: RequestReconciliationServiceConfigs) {
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
      partnerKid: this.partnerKey.kid,
    });
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
    const { encryptedPartnerData, kid } = await this.requestService.download();
    if (encryptedPartnerData && kid) {
      // decrypt data and inject to service
      await this.dataService.loadPartnerData(encryptedPartnerData, kid);

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

    // init reconciliation-builder contracts
    // sign contracts
    const reconciliationId = uuidv4();
    const contractPayload = new DailyReconciliationContractPayload({
      iss: this.myId,
      aud: this.partnerId,
      // Todo: what is sub here?
      sub: this.partnerId,
      // Todo: should use reconciliation-builder record id
      contractId: reconciliationId,
      stats: this.dataService.myData.statsDataset,
    });
    const contract = new DailyReconciliationContract(contractPayload);
    await contract.sign(this.myKey.privateKey);
    // Todo: create reconciliation-builder record with contracts data
    await this.dataService.dataBuilder.createReconciliationRecord({
      reconciliationId,
      contract: contract.data,
      partnerId: this.partnerId,
      date: this.date,
      status: 'pending',
    });

    // init moneta event with contracts data
    const event = new DailyReconciliationRequestEvent({
      payload: {
        contract: contract.data,
      },
    });
    // send reconciliation-builder request to monetaService
    const sendEventRes = await this.requestService.send(event);
    await this.dataService.dataBuilder.updateReconciliationRecord({
      reconciliationId,
      contract: sendEventRes.contract,
    });
  }
}
