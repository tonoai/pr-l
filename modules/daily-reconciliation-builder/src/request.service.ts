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

    console.log(uploadLink);

    // Todo: store to local storage before upload
    const blob = new Blob([JSON.stringify(data)], { type: 'application/octet-stream' });

    const response = await fetch(uploadLink, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'application/octet-stream', // Adjust this as needed
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
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
