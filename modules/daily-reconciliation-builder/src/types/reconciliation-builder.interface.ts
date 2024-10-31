export interface ReconciliationBuilderInterface {
  upsertReconciliation<T>(input: Partial<T>): Promise<T>;

  upsertReconciliationMismatches<T>(input: Partial<T>[]): Promise<T[]>;

  upsertReconciliationResolution<T>(input: Partial<T>): Promise<T>;
}
