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
