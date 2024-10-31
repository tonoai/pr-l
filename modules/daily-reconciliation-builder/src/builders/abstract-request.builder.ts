import type {
  DownloadInfoInterface,
  RequestBuilderInterface,
  UploadInfoInterface,
} from '../types/request-builder-interface';
import type { DailyReconciliationRequestPinetEvent } from '@pressingly-modules/event-contract/src/events/daily-reconciliation-request.pinet-event';
import type { DailyReconciliationResponsePinetEvent } from '@pressingly-modules/event-contract/src/events/daily-reconciliation-response.-pinet-event';
import type { KeyObject } from 'crypto';
import type { EventResponse } from '@pressingly-modules/event-contract/src/events/types/event-response';
import type { PublicKeyInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/key.interface';

export abstract class AbstractRequestBuilder implements RequestBuilderInterface {
  abstract getUploadInfo(
    partnerId: string,
    partnerKid: string,
    date: Date,
  ): Promise<UploadInfoInterface>;

  abstract getDownloadInfo(partnerId: string, date: Date): Promise<DownloadInfoInterface>;

  abstract sendEvent(
    event: DailyReconciliationRequestPinetEvent | DailyReconciliationResponsePinetEvent,
  ): Promise<EventResponse>;

  abstract getPublicKey(kid: string): Promise<KeyObject>;

  abstract getPinetCorePublicKey(kid: string): Promise<KeyObject>;

  abstract getPartnerPublicKey(partnerId: string): Promise<PublicKeyInterface>;
}
