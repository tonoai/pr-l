import type { DataBuilderInterface } from '../types/data-builder.interface';
import type {
  FinalizedDisputeDatasetInterface,
  NewDisputeDatasetInterface,
  StatsDatasetInterface,
  SubscriptionChargeDatasetInterface,
} from '../types/reconciliation-dataset.interface';

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
  abstract updateSubscriptionCharge(input: SubscriptionChargeDatasetInterface): Promise<any>;
  abstract createSubscriptionCharge(input: SubscriptionChargeDatasetInterface): Promise<any>;
  abstract deleteSubscriptionCharge(input: SubscriptionChargeDatasetInterface): Promise<any>;
}
