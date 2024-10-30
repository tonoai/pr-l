import {
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

  createReconciliationRecord(input: any): Promise<any>;
  updateReconciliationRecord(input: any): Promise<any>;

  updateSubscriptionCharge(input: SubscriptionChargeDatasetInterface): Promise<any>;
  createSubscriptionCharge(input: SubscriptionChargeDatasetInterface): Promise<any>;
  deleteSubscriptionCharge(input: SubscriptionChargeDatasetInterface): Promise<any>;
}
