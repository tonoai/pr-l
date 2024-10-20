import { RequestBuilderInterface } from './types/request-builder-interface';
import { DailyReconciliationRequestEvent } from './events/daily-reconciliation-request.event';
import { DailyReconciliationResponseEvent } from './events/daily-reconciliation-response.event';
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

  async upload(data: any): Promise<string> {
    return this.requestBuilder.upload(data, this.partnerId, this.date);
  }

  async download(): Promise<any> {
    return this.requestBuilder.download(this.myId, this.date);
  }

  send(event: DailyReconciliationRequestEvent | DailyReconciliationResponseEvent): Promise<void> {
    return this.requestBuilder.send(event);
  }

  async getPublicKeyByKid(kid: string): Promise<PublicKeyInterface> {
    return this.requestBuilder.getPublicKeyByKid(kid);
  }
}
