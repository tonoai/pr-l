import { PublicKeyInterface } from './key.interface';
import { DailyReconciliationRequestEvent } from '../../../event-contract/src/events/daily-reconciliation-request.event';
import { DailyReconciliationResponseEvent } from '../../../event-contract/src/events/daily-reconciliation-response.event';

export interface DownloadInfoInterface {
  downloadUrl: string;
  kid: string;
}

export interface RequestBuilderInterface {
  getUploadLink(partnerId: string, partnerKid: string, date: Date): Promise<string>;
  getDownloadInfo(partnerId: string, date: Date): Promise<DownloadInfoInterface>;
  send(event: DailyReconciliationRequestEvent | DailyReconciliationResponseEvent): Promise<void>;
  getFirstPublicKeyOfProject(projectId: string): Promise<PublicKeyInterface>;
}
