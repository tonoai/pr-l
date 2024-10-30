import type {
  FinalizedDisputeDatasetInterface,
  NewDisputeDatasetInterface,
  StatsDatasetInterface,
  SubscriptionChargeDatasetInterface,
} from './reconciliation-dataset.interface';

export interface DataBuilderInterface {
  getSubscriptionCharges(
    partnerId: string,
    date: Date,
  ): Promise<SubscriptionChargeDatasetInterface[]>;

  getNewDisputes(partnerId: string, date: Date): Promise<NewDisputeDatasetInterface[]>;

  getFinalizedDisputes(partnerId: string, date: Date): Promise<FinalizedDisputeDatasetInterface[]>;

  getStats(partnerId: string, date: Date): Promise<StatsDatasetInterface>;

  updateSubscriptionCharge(
    partnerId: string,
    input: SubscriptionChargeDatasetInterface,
  ): Promise<any>;

  createSubscriptionCharge(
    partnerId: string,
    input: SubscriptionChargeDatasetInterface,
  ): Promise<any>;

  deleteSubscriptionCharge(
    partnerId: string,
    input: SubscriptionChargeDatasetInterface,
  ): Promise<any>;
}
