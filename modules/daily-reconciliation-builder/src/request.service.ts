import type { RequestBuilderInterface } from './types/request-builder-interface';
import type { DailyReconciliationRequestPinetEvent } from '@pressingly-modules/event-contract/src/events/daily-reconciliation-request.pinet-event';
import type { DailyReconciliationResponsePinetEvent } from '@pressingly-modules/event-contract/src/events/daily-reconciliation-response.-pinet-event';
import type { EncryptedReconciliationDatasetInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-dataset.interface';
import type { EventResponse } from '@pressingly-modules/event-contract/src/events/types/event-response';
import * as JSZip from 'jszip';

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

  async upload(data: EncryptedReconciliationDatasetInterface): Promise<string> {
    const { uploadUrl, attachmentId } = await this.requestBuilder.getUploadInfo(
      this.partnerId,
      this.partnerKid,
      this.date,
    );

    const zip = new JSZip();

    // Todo: store the encrypted data to local storage

    // Todo: dynamic filename
    zip.file('encrypted_data.jwe', JSON.stringify(data));
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: zipBlob,
      headers: {
        'Content-Type': 'application/zip',
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return attachmentId;
  }

  async download(): Promise<EncryptedReconciliationDatasetInterface | null> {
    try {
      const { downloadUrl } = await this.requestBuilder.getDownloadInfo(this.partnerId, this.date);

      const response = await fetch(downloadUrl);

      const blob = await response.blob();
      const textContent = await blob.text();
      const encryptedData = JSON.parse(textContent);

      return encryptedData as EncryptedReconciliationDatasetInterface;
    } catch (error) {
      return null;
    }
  }

  send(
    event: DailyReconciliationRequestPinetEvent | DailyReconciliationResponsePinetEvent,
  ): Promise<EventResponse> {
    return this.requestBuilder.sendEvent(event);
  }
}
