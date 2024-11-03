import type {
  ReconciliationDatasetInterface,
  StatsDatasetInterface,
} from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-dataset.interface';
import type { DailyReconciliationMismatchInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-mismatch.interface';
import {
  DailyReconciliationMismatchRefType,
  DailyReconciliationMismatchStatus,
  DailyReconciliationMismatchType,
} from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-mismatch.interface';

export class CompareDatasetUtils {
  static compareDatasets<T>(
    dataset: keyof ReconciliationDatasetInterface,
    array1: T[],
    array2: T[],
  ): Partial<DailyReconciliationMismatchInterface<T>>[] {
    const mismatches: Partial<DailyReconciliationMismatchInterface<T>>[] = [];

    const indexMap = new Map<string, number>();

    let refIdKey: string;
    let refType: DailyReconciliationMismatchRefType;
    if (dataset === 'subscriptionChargeDataset') {
      refIdKey = 'finalizedContractId';
      refType = DailyReconciliationMismatchRefType.FINALIZED_SUBSCRIPTION_CHARGE;
    } else if (dataset === 'newDisputeDataset') {
      refIdKey = 'contractId';
      refType = DailyReconciliationMismatchRefType.NEW_DISPUTE;
    } else {
      refIdKey = 'contractId';
      refType = DailyReconciliationMismatchRefType.FINALIZED_DISPUTE;
    }
    // Populate the map with indices from array1
    // we may optimize by sort 2 arrays by id, then compare
    // But it will spend cost to sort, and not good with large data
    // We can sort by id at collect data, then compare by id
    // But we don't trust the input data
    array1.forEach((item, index) => {
      indexMap.set(item[refIdKey], index);
    });

    // Compare records in array2 against indices in indexMap
    array2.forEach(item2 => {
      const index1 = indexMap.get(item2[refIdKey]);
      if (index1 !== undefined) {
        const item1 = array1[index1];
        // Record exists in both arrays, check for field conflicts
        if (
          CompareDatasetUtils.areObjectsEqual(
            item1 as Record<string, any>,
            item2 as Record<string, any>,
          )
        ) {
          mismatches.push({
            refId: item1[refIdKey],
            refType: refType,
            data: item1,
            partnerData: item2,
            type: DailyReconciliationMismatchType.CONFLICTED,
            status: DailyReconciliationMismatchStatus.PENDING,
            message: 'Data mismatch',
          });
        }
        // Remove the processed item from indexMap
        indexMap.delete(item2[refIdKey]);
      } else {
        // Item2 is redundant if it doesn't exist in array1
        mismatches.push({
          refId: item2[refIdKey],
          refType: refType,
          partnerData: item2,
          type: DailyReconciliationMismatchType.REDUNDANT,
          status: DailyReconciliationMismatchStatus.PENDING,
          message: 'Redundant record in second array',
        });
      }
    });

    // Any remaining items in indexMap are missing in array2
    indexMap.forEach((index, key) => {
      const item1 = array1[index];
      mismatches.push({
        refId: key,
        refType: refType,
        data: item1,
        type: DailyReconciliationMismatchType.MISSING,
        status: DailyReconciliationMismatchStatus.PENDING,
        message: 'Record missing in second array',
      });
    });

    return mismatches;
  }

  static compareStats(
    stats1: StatsDatasetInterface,
    stats2: StatsDatasetInterface,
  ): Partial<DailyReconciliationMismatchInterface<StatsDatasetInterface>>[] {
    if (!CompareDatasetUtils.areObjectsEqual(stats1, stats2)) {
      return [
        {
          refType: DailyReconciliationMismatchRefType.STATS,
          data: stats1,
          partnerData: stats2,
          type: DailyReconciliationMismatchType.CONFLICTED,
          status: DailyReconciliationMismatchStatus.PENDING,
          message: 'Data mismatch',
        },
      ];
    }

    return [];
  }

  static areObjectsEqual<T extends Record<string, any>>(obj1: T, obj2: T): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    return true;
  }
}
