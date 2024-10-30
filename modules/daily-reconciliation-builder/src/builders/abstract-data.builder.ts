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

  abstract updateSubscriptionCharge(
    partnerId: string,
    input: SubscriptionChargeDatasetInterface,
  ): Promise<any>;

  abstract createSubscriptionCharge(
    partnerId: string,
    input: SubscriptionChargeDatasetInterface,
  ): Promise<any>;

  abstract deleteSubscriptionCharge(
    partnerId: string,
    input: SubscriptionChargeDatasetInterface,
  ): Promise<any>;
}
