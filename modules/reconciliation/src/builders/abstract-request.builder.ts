import { DownloadInfoInterface, RequestBuilderInterface } from '../types/request-builder-interface';
import { PublicKeyInterface } from '../types/key.interface';
import { DailyReconciliationRequestEvent } from '@pressingly-modules/event-contract/src/events/daily-reconciliation-request.event';
import { DailyReconciliationResponseEvent } from '@pressingly-modules/event-contract/src/events/daily-reconciliation-response.event';

export interface RequestBuilderConfigs {
  date: Date;
  partnerId: string;
}
export abstract class AbstractRequestBuilder implements RequestBuilderInterface {
  abstract getUploadLink(partnerId: string, partnerKid: string, date: Date): Promise<string>;
  abstract getDownloadInfo(partnerId: string, date: Date): Promise<DownloadInfoInterface>;
  abstract send(
    event: DailyReconciliationRequestEvent | DailyReconciliationResponseEvent,
  ): Promise<void>;
  abstract getFirstPublicKeyOfProject(projectId: string): Promise<PublicKeyInterface>;
}
