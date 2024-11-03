import type { Nullable } from '@pressingly-modules/core/src/types/common.type';

export enum DailyReconciliationMismatchRefType {
  FINALIZED_SUBSCRIPTION_CHARGE = 'finalizedSubscriptionCharge',
  NEW_DISPUTE = 'newDispute',
  FINALIZED_DISPUTE = 'finalizedDispute',
  STATS = 'stats',
}

export enum DailyReconciliationMismatchType {
  CONFLICTED = 'conflicted',
  MISSING = 'missing',
  REDUNDANT = 'redundant',
}

export enum DailyReconciliationMismatchStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
}

export interface DailyReconciliationMismatchInterface<T> {
  id: string;
  reconciliationId?: string;
  refId: string;
  refType: string;
  type: DailyReconciliationMismatchType;
  data: T;
  partnerData: T;
  status: DailyReconciliationMismatchStatus;
  message: Nullable<string>;
}
