export enum DailyReconciliationResolutionsAction {
  MODIFY = 'modify',
  CREATE = 'create',
  DELETE = 'delete',
}

export interface DailyReconciliationResolutionInterface {
  reconciliationMismatchId: string;
  originalData: Record<string, any>;
  modifiedData: Record<string, any>;
  action: DailyReconciliationResolutionsAction;
  actionById: string;
}
