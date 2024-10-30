import type { ReconciliationBuilderInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-builder.interface';

export abstract class AbstractReconciliationBuilder implements ReconciliationBuilderInterface {
  abstract upsertReconciliation<Entity>(input: Partial<Entity>): Promise<Entity>;

  abstract upsertReconciliationMismatch<Entity>(input: Partial<Entity>): Promise<Entity>;

  abstract upsertReconciliationResolution<Entity>(input: Partial<Entity>): Promise<Entity>;
}
