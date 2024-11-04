export enum DailyReconciliationSubscriptionChargeMismatchStatus {
  MATCHED = 'matched',
  MISMATCHED = 'mismatched',
}

export enum DailyReconciliationSubscriptionChargeClearanceStatus {
  RECONCILED = 'reconciled',
  UNRECONCILED = 'unreconciled',
}

export interface DailyReconciliationSubscriptionChargeInterface {
  subscriptionChargeId: string;
  mismatchStatus: DailyReconciliationSubscriptionChargeMismatchStatus;
  clearanceStatus: DailyReconciliationSubscriptionChargeClearanceStatus;
  reconcileDate: Date;
}
