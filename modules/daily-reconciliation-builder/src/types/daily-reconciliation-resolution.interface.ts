import type { Nullable } from '@pressingly-modules/core/src/types/common.type';

export enum DailyReconciliationResolutionsAction {
  MODIFY = 'modify',
  CREATE = 'create',
  DELETE = 'delete',
}

export enum DailyReconciliationResolutionsActionType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
}

export interface DailyReconciliationResolutionInterface {
  reconciliationMismatchId: string;
  originalData: Record<string, any>;
  modifiedData: Record<string, any>;
  action: DailyReconciliationResolutionsAction;
  actionType: DailyReconciliationResolutionsActionType;
  actionById: Nullable<string>;
}
