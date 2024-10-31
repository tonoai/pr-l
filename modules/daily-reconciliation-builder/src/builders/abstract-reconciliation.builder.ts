import type { ReconciliationBuilderInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-builder.interface';

export abstract class AbstractReconciliationBuilder implements ReconciliationBuilderInterface {
  abstract upsertReconciliation<T>(input: Partial<T>): Promise<T>;

  abstract upsertReconciliationMismatches<T>(input: Partial<T>[]): Promise<T[]>;

  abstract upsertReconciliationResolution<T>(input: Partial<T>): Promise<T>;
}
