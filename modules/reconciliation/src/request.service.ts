import { RequestBuilderInterface } from './types/request-builder-interface';
import { DailyReconciliationRequestEvent } from '../../event-contract/src/events/daily-reconciliation-request.event';
import { DailyReconciliationResponseEvent } from '../../event-contract/src/events/daily-reconciliation-response.event';
import { PublicKeyInterface } from './types/key.interface';

export interface RequestServiceConfigs {
  requestBuilder: RequestBuilderInterface;
  date: Date;
  myId: string;
  partnerId: string;
}
export class RequestService {
  private requestBuilder: RequestBuilderInterface;
  private readonly date: Date;
  private readonly partnerId: string;
  private readonly myId: string;

  constructor(configs: RequestServiceConfigs) {
    this.requestBuilder = configs.requestBuilder;
    this.date = configs.date;
    this.myId = configs.myId;
    this.partnerId = configs.partnerId;
  }

  async upload(data: any): Promise<void> {
    const uploadLink = await this.requestBuilder.getUploadLink(data, this.partnerId, this.date);
    // Todo: upload data to uploadLink
  }

  async download(): Promise<{ data: any; kid: string }> {
    const { downloadUrl, kid } = await this.requestBuilder.getDownloadInfo(this.myId, this.date);
    // Todo: download data from downloadUrl
    // return downloaded data (encrypted) and kid to decrypt

    // Todo: publisher and membership only use one key for now
    // so the return kid must be the same as publisher kid/ membership kid
    return { data: downloadUrl, kid };
  }

  send(event: DailyReconciliationRequestEvent | DailyReconciliationResponseEvent): Promise<void> {
    return this.requestBuilder.send(event);
  }

  async getPublicKeyByKid(kid: string): Promise<PublicKeyInterface> {
    return this.requestBuilder.getPublicKeyByKid(kid);
  }
}
