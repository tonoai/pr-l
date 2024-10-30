import {
  DailyReconciliationMismatchRefType,
  DailyReconciliationMismatchStatus,
  DailyReconciliationMismatchType,
} from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-mismatch.interface';
import { PinetContract } from '@pressingly-modules/event-contract/src/events/pinet-event';

export interface SubscriptionChargeDatasetInterface {
  finalizedContractId: string;
  userId: string;
  amount: number;
  currency: string;
  finalizedAt: number;
  interchangeFee: number;
  finalizedContract: PinetContract;
}

export interface NewDisputeDatasetInterface {
  // Todo: This data cannot re-exported
  contractId: string;
  contract: PinetContract;
  issuedAt: number;
}

export interface StatsDatasetInterface {
  totalSubscriptionChargeAmount: number;
  totalInterchangeFee: number;
  newDisputeCount: number;
}

export interface FinalizedDisputeDatasetInterface {
  contractId: string;
  resolvedAt: number;
  contract: PinetContract;
}

export interface ReconciliationDatasetInterface {
  subscriptionChargeDataset: SubscriptionChargeDatasetInterface[];
  newDisputeDataset: NewDisputeDatasetInterface[];
  finalizedDisputeDataset: FinalizedDisputeDatasetInterface[];
  statsDataset: StatsDatasetInterface;
}

export interface EncryptedReconciliationDatasetInterface {
  encryptedSubscriptionChargeDataSet: string;
  encryptedNewDisputeDataSet: string;
  encryptedFinalizedDisputeDataSet: string;
  encryptedStatDataset: string;
}

export type ReconciliationDataset =
  | SubscriptionChargeDatasetInterface[]
  | NewDisputeDatasetInterface[]
  | FinalizedDisputeDatasetInterface[]
  | StatsDatasetInterface;

export type ReconciliationDataType =
  | SubscriptionChargeDatasetInterface
  | NewDisputeDatasetInterface
  | FinalizedDisputeDatasetInterface
  | StatsDatasetInterface;

export interface DailyReconciliationMismatch<T> {
  refId?: string;
  refType: DailyReconciliationMismatchRefType;
  data?: T;
  partnerData?: T;
  type: DailyReconciliationMismatchType;
  status: DailyReconciliationMismatchStatus;
  message: string;
}

export interface ReconciliationMismatchInterface {
  subscriptionCharge: DailyReconciliationMismatch<SubscriptionChargeDatasetInterface>[];
  newDispute: DailyReconciliationMismatch<NewDisputeDatasetInterface>[];
  finalizedDispute: DailyReconciliationMismatch<FinalizedDisputeDatasetInterface>[];
  stats: DailyReconciliationMismatch<StatsDatasetInterface>[];
  isMismatched: boolean;
}
