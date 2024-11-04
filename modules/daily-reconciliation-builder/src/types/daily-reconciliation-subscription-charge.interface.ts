export enum DailyReconciliationSubscriptionChargeMismatchStatus {
  MATCHED = 'matched',
  MISMATCHED = 'mismatched',
}

export enum DailyReconciliationSubscriptionChargeClearanceStatus {
  RECONCILED = 'reconciled',
  UNRECONCILED = 'unreconciled',
}

export interface DailyReconciliationSubscriptionChargeInterface {
  subscriptionChargesId: string;
  mismatchStatus: DailyReconciliationSubscriptionChargeMismatchStatus;
  clearanceStatus: DailyReconciliationSubscriptionChargeClearanceStatus;
}
