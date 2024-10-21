import { RequestBuilderInterface } from '../types/request-builder-interface';
import { DailyReconciliationRequestEvent } from '../events/daily-reconciliation-request.event';
import { DailyReconciliationResponseEvent } from '../events/daily-reconciliation-response.event';
import { PublicKeyInterface } from '../types/key.interface';

export interface RequestBuilderConfigs {
  date: Date;
  partnerId: string;
}
export abstract class AbstractRequestBuilder implements RequestBuilderInterface {
  abstract getUploadLink(file: any, partnerId: string, date: Date): Promise<string>;
  abstract getDownloadInfo(partnerId: string, date: Date): Promise<any>;
  abstract send(
    event: DailyReconciliationRequestEvent | DailyReconciliationResponseEvent,
  ): Promise<void>;
  abstract getFirstPublicKeyByProjectId(kid: string): Promise<PublicKeyInterface>;
}
