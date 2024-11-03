import type { PinetContract } from '@pressingly-modules/event-contract/src/events/pinet-event';
import type { Nullable } from '@pressingly-modules/core/src/types/common.type';

export enum DailyReconciliationStatus {
  PROCESSING = 'processing',
  RECONCILED = 'reconciled',
  UNRECONCILED = 'unreconciled',
  FAILED = 'failed',
}

export interface DailyReconciliationInterface {
  id: string;
  partnerId: string;
  date: Date;
  attachmentId: string;
  partnerAttachmentId: string;
  status: DailyReconciliationStatus;
  totalAmount: number;
  totalInterchangeFee: number;
  currencyCode: string;
  message: string;
  contract: PinetContract;
  issuedAt: Date;
  reconciledAt: Nullable<Date>;
}
