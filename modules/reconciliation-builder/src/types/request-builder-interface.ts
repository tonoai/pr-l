import { DailyReconciliationRequestEvent } from '../../../event-contract/src/events/daily-reconciliation-request.event';
import { DailyReconciliationResponseEvent } from '../../../event-contract/src/events/daily-reconciliation-response.event';
import { EventResponse } from '@pressingly-modules/event-contract/src/events/types/event-response';
import { KeyObject } from 'crypto';
import { PublicKeyInterface } from '@pressingly-modules/reconciliation-builder/src/types/key.interface';

export interface DownloadInfoInterface {
  downloadUrl: string;
  kid: string;
}

export interface RequestBuilderInterface {
  getUploadLink(partnerId: string, partnerKid: string, date: Date): Promise<string>;
  getDownloadInfo(partnerId: string, date: Date): Promise<DownloadInfoInterface>;
  send(
    event: DailyReconciliationRequestEvent | DailyReconciliationResponseEvent,
  ): Promise<EventResponse>;
  getPublicKey(kid: string): Promise<KeyObject>;
  getPinetCorePublicKey(kid: string): Promise<KeyObject>;
  getPartnerPublicKey(partnerId: string): Promise<PublicKeyInterface>;
}
