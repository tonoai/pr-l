import { DataBuilderInterface } from '../types/data-builder.interface';
import {
  FinalizedDisputeDatasetInterface,
  NewDisputeDatasetInterface,
  StatsDatasetInterface,
  SubscriptionChargeDatasetInterface,
} from '../types/reconciliation-dataset.interface';

export interface DataBuilderConfigs {
  date: Date;
  partnerId: string;
}

export abstract class AbstractDataBuilder implements DataBuilderInterface {
  abstract getSubscriptionCharges(
    partnerId: string,
    date: Date,
  ): Promise<SubscriptionChargeDatasetInterface[]>;
  abstract getNewDisputes(partnerId: string, date: Date): Promise<NewDisputeDatasetInterface[]>;
  abstract getFinalizedDisputes(
    partnerId: string,
    date: Date,
  ): Promise<FinalizedDisputeDatasetInterface[]>;
  abstract getStats(partnerId: string, date: Date): Promise<StatsDatasetInterface>;
  abstract createReconciliationRecord(): Promise<any>;
  abstract updateReconciliationRecord(): Promise<any>;
}
