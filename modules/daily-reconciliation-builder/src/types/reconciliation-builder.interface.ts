export interface ReconciliationBuilderInterface {
  upsertReconciliation<Entity>(input: Partial<Entity>): Promise<Entity>;

  upsertReconciliationMismatch<Entity>(input: Partial<Entity>): Promise<Entity>;

  upsertReconciliationResolution<Entity>(input: Partial<Entity>): Promise<Entity>;
}
