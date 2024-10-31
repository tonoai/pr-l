import type { DailyReconciliationRequestPinetEvent } from '@pressingly-modules/event-contract/src/events/daily-reconciliation-request.pinet-event';
import type { DailyReconciliationResponsePinetEvent } from '@pressingly-modules/event-contract/src/events/daily-reconciliation-response.-pinet-event';
import type { EventResponse } from '@pressingly-modules/event-contract/src/events/types/event-response';
import type { KeyObject } from 'crypto';
import type { PublicKeyInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/key.interface';

export interface DownloadInfoInterface {
  downloadUrl: string;
}

export interface UploadInfoInterface {
  uploadUrl: string;
  attachmentId: string;
}

export interface RequestBuilderInterface {
  getUploadInfo(partnerId: string, partnerKid: string, date: Date): Promise<UploadInfoInterface>;

  getDownloadInfo(partnerId: string, date: Date): Promise<DownloadInfoInterface>;

  sendEvent(
    event: DailyReconciliationRequestPinetEvent | DailyReconciliationResponsePinetEvent,
  ): Promise<EventResponse>;

  getPublicKey(kid: string): Promise<KeyObject>;

  getPinetCorePublicKey(kid: string): Promise<KeyObject>;

  getPartnerPublicKey(partnerId: string): Promise<PublicKeyInterface>;
}
