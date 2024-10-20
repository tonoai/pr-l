export interface SubscriptionChargeDatasetInterface {
  finalizedContractId: string;
  userId: string;
  amount: number;
  currency: string;
  finalizedAt: number;
  interchangeFee: number;
  finalizedContract: string;
}

export interface NewDisputeDatasetInterface {
  contractId: string;
  contract: string;
  issuedAt: number;
}

export interface FinalizedDisputeDatasetInterface {
  contractId: string;
  resolvedAt: number;
  contract: string;
}

export interface StatsDatasetInterface {
  totalSubscriptionChargeAmount: Record<string, number>;
  totalInterchangeFee: Record<string, number>;
  newDisputeCount: number;
}

export interface FinalizedDisputeDatasetInterface {
  contractId: string;
  resolvedAt: number;
  contract: string;
}

export interface ReconciliationDatasetInterface {
  subscriptionChargeDataset: SubscriptionChargeDatasetInterface[];
  newDisputeDataset: NewDisputeDatasetInterface[];
  finalizedDisputeDataset: FinalizedDisputeDatasetInterface[];
  statsDataset: StatsDatasetInterface;
}

export type ReconciliationDataset =
  | SubscriptionChargeDatasetInterface[]
  | NewDisputeDatasetInterface[]
  | FinalizedDisputeDatasetInterface[]
  | StatsDatasetInterface;
