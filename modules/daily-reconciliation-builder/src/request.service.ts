import type { RequestBuilderInterface } from './types/request-builder-interface';
import type { DailyReconciliationRequestEvent } from '../../event-contract/src/events/daily-reconciliation-request.event';
import type { DailyReconciliationResponseEvent } from '../../event-contract/src/events/daily-reconciliation-response.event';
import type { EncryptedReconciliationDatasetInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-dataset.interface';
import type { EventResponse } from '@pressingly-modules/event-contract/src/events/types/event-response';

export interface RequestServiceConfigs {
  requestBuilder: RequestBuilderInterface;
  date: Date;
  id: string;
  partnerId: string;
  partnerKid: string;
}

export class RequestService {
  public requestBuilder: RequestBuilderInterface;
  private readonly date: Date;
  private readonly partnerId: string;
  private readonly partnerKid: string;
  private readonly id: string;

  constructor(configs: RequestServiceConfigs) {
    this.requestBuilder = configs.requestBuilder;
    this.date = configs.date;
    this.id = configs.id;
    this.partnerId = configs.partnerId;
    this.partnerKid = configs.partnerKid;
  }

  async upload(data: EncryptedReconciliationDatasetInterface): Promise<void> {
    const uploadLink = await this.requestBuilder.getUploadLink(
      this.partnerId,
      this.partnerKid,
      this.date,
    );
    // Todo: upload data to uploadLink
    // create each file for each dataset, then compress them into one file
    // return void
  }

  async download(): Promise<EncryptedReconciliationDatasetInterface | null> {
    try {
      const { downloadUrl } = await this.requestBuilder.getDownloadInfo(this.partnerId, this.date);

      // Todo: download data from downloadUrl
      // return downloaded data (encrypted) and kid to decrypt
      return {} as EncryptedReconciliationDatasetInterface;
    } catch (error) {
      return null;
    }
  }

  send(
    event: DailyReconciliationRequestEvent | DailyReconciliationResponseEvent,
  ): Promise<EventResponse> {
    return this.requestBuilder.sendEvent(event);
  }
}
