import type {
  DownloadInfoInterface,
  RequestBuilderInterface,
} from '../types/request-builder-interface';
import type { DailyReconciliationRequestEvent } from '@pressingly-modules/event-contract/src/events/daily-reconciliation-request.event';
import type { DailyReconciliationResponseEvent } from '@pressingly-modules/event-contract/src/events/daily-reconciliation-response.event';
import type { KeyObject } from 'crypto';
import type { EventResponse } from '@pressingly-modules/event-contract/src/events/types/event-response';
import type { PublicKeyInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/key.interface';

export abstract class AbstractRequestBuilder implements RequestBuilderInterface {
  abstract getUploadLink(partnerId: string, partnerKid: string, date: Date): Promise<string>;

  abstract getDownloadInfo(partnerId: string, date: Date): Promise<DownloadInfoInterface>;

  abstract sendEvent(
    event: DailyReconciliationRequestEvent | DailyReconciliationResponseEvent,
  ): Promise<EventResponse>;

  abstract getPublicKey(kid: string): Promise<KeyObject>;

  abstract getPinetCorePublicKey(kid: string): Promise<KeyObject>;

  abstract getPartnerPublicKey(partnerId: string): Promise<PublicKeyInterface>;
}
