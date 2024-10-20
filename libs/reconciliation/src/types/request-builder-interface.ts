import { PublicKeyInterface } from './key.interface';
import { DailyReconciliationRequestEvent } from '../events/daily-reconciliation-request.event';
import { DailyReconciliationResponseEvent } from '../events/daily-reconciliation-response.event';

export interface RequestBuilderInterface {
  upload(file: any, partnerId: string, date: Date): Promise<string>; // upload link
  download(partnerId: string, date: Date): Promise<any>; // zip file
  send(event: DailyReconciliationRequestEvent | DailyReconciliationResponseEvent): Promise<void>;
  getPublicKeyByKid(kid: string): Promise<PublicKeyInterface>;
}
