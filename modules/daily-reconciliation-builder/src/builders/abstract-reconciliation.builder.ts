import type { ReconciliationBuilderInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-builder.interface';
import type { DailyReconciliationInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation.interface';
import type { DailyReconciliationMismatchInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-mismatch.interface';
import type { DailyReconciliationResolutionInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-resolution.interface';
import type { ReconciliationDataType } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-dataset.interface';
import type { DailyReconciliationSubscriptionChargeInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-subscription-charge.interface';

export abstract class AbstractReconciliationBuilder implements ReconciliationBuilderInterface {
  abstract upsertReconciliation(
    input: Partial<DailyReconciliationInterface>,
  ): Promise<DailyReconciliationInterface>;

  abstract upsertReconciliationMismatches(
    input: Partial<DailyReconciliationMismatchInterface<ReconciliationDataType>>[],
  ): Promise<DailyReconciliationMismatchInterface<ReconciliationDataType>[]>;

  abstract upsertReconciliationResolution(
    input: Partial<DailyReconciliationResolutionInterface>,
  ): Promise<DailyReconciliationResolutionInterface>;

  abstract upsertReconciliationSubscriptionCharges(
    input: Partial<DailyReconciliationSubscriptionChargeInterface>[],
  ): Promise<DailyReconciliationSubscriptionChargeInterface[]>;
}
