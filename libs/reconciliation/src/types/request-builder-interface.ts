import { PublicKeyInterface } from './key.interface';
import { DailyReconciliationRequestEvent } from '../events/daily-reconciliation-request.event';
import { DailyReconciliationResponseEvent } from '../events/daily-reconciliation-response.event';

export interface RequestBuilderInterface {
  getUploadLink(file: any, partnerId: string, date: Date): Promise<string>;
  getDownloadInfo(partnerId: string, date: Date): Promise<{ downloadUrl: string; kid: string }>;
  send(event: DailyReconciliationRequestEvent | DailyReconciliationResponseEvent): Promise<void>;
  getFirstPublicKeyByProjectId(kid: string): Promise<PublicKeyInterface>;
}
