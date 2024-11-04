import type { DailyReconciliationInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation.interface';
import type { DailyReconciliationMismatchInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-mismatch.interface';
import type { DailyReconciliationResolutionInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-resolution.interface';
import type { ReconciliationDataType } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-dataset.interface';
import type { DailyReconciliationSubscriptionChargeInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-subscription-charge.interface';

export interface ReconciliationBuilderInterface {
  upsertReconciliation(
    input: Partial<DailyReconciliationInterface>,
  ): Promise<DailyReconciliationInterface>;

  upsertReconciliationMismatches(
    input: Partial<DailyReconciliationMismatchInterface<ReconciliationDataType>>[],
  ): Promise<DailyReconciliationMismatchInterface<ReconciliationDataType>[]>;

  upsertReconciliationResolution(
    input: Partial<DailyReconciliationResolutionInterface>,
  ): Promise<DailyReconciliationResolutionInterface>;

  upsertReconciliationSubscriptionCharges(
    input: Partial<DailyReconciliationSubscriptionChargeInterface>[],
  ): Promise<DailyReconciliationSubscriptionChargeInterface[]>;
}
