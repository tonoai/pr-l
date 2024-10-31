import type {
  DailyReconciliationMismatch,
  EncryptedReconciliationDatasetInterface,
  FinalizedDisputeDatasetInterface,
  NewDisputeDatasetInterface,
  ReconciliationDataset,
  ReconciliationDatasetInterface,
  ReconciliationMismatchInterface,
  StatsDatasetInterface,
  SubscriptionChargeDatasetInterface,
} from './types/reconciliation-dataset.interface';
import type { PrivateKeyInterface, PublicKeyInterface } from './types/key.interface';
import { compactDecrypt, CompactEncrypt } from 'jose';
import type { DataBuilderInterface } from './types/data-builder.interface';
import { CompareDatasetUtils } from '@pressingly-modules/daily-reconciliation-builder/src/utils/compare-dataset.utils';
import { DailyReconciliationMismatchType } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-mismatch.interface';
import { SubscriptionChargeContract } from '@pressingly-modules/event-contract/src/contract/subscription-charge/subscription-charge.contract';

export interface DataServiceConfigs {
  dataBuilder: DataBuilderInterface;
  key: PrivateKeyInterface;
  partnerKey: PublicKeyInterface;
  date: Date;
  partnerId: string;
}

export interface ConflictInterface {
  index: number;
  data: SubscriptionChargeDatasetInterface;
  partnerIndex: number;
  partnerData: SubscriptionChargeDatasetInterface;
}

export class DataService {
  public dataBuilder: DataBuilderInterface;
  private key: PrivateKeyInterface;
  private partnerKey: PublicKeyInterface;
  private date: Date;
  private partnerId: string;
  data!: ReconciliationDatasetInterface;
  partnerData!: ReconciliationDatasetInterface;
  dataMismatch: ReconciliationMismatchInterface = {
    subscriptionCharge: [],
    newDispute: [],
    finalizedDispute: [],
    stats: [],
    isMismatched: false,
  };

  constructor(configs: DataServiceConfigs) {
    this.dataBuilder = configs.dataBuilder;
    this.key = configs.key;
    this.partnerKey = configs.partnerKey;
    this.date = configs.date;
    this.partnerId = configs.partnerId;
  }

  async loadOwnData(): Promise<this> {
    this.data = await Promise.all([
      this.dataBuilder.getSubscriptionCharges(this.partnerId, this.date),
      this.dataBuilder.getNewDisputes(this.partnerId, this.date),
      this.dataBuilder.getFinalizedDisputes(this.partnerId, this.date),
      this.dataBuilder.getStats(this.partnerId, this.date),
    ]).then(
      ([subscriptionChargeDataset, newDisputeDataset, finalizedDisputeDataset, statsDataset]) => ({
        subscriptionChargeDataset,
        newDisputeDataset,
        finalizedDisputeDataset,
        statsDataset,
      }),
    );

    return this;
  }

  async loadPartnerData(encryptedData: EncryptedReconciliationDatasetInterface) {
    this.partnerData = await Promise.all([
      this.decryptData<SubscriptionChargeDatasetInterface[]>(
        encryptedData.encryptedSubscriptionChargeDataSet,
      ),
      this.decryptData<NewDisputeDatasetInterface[]>(encryptedData.encryptedNewDisputeDataSet),
      this.decryptData<FinalizedDisputeDatasetInterface[]>(
        encryptedData.encryptedFinalizedDisputeDataSet,
      ),
      this.decryptData<StatsDatasetInterface>(encryptedData.encryptedStatDataset),
    ]).then(
      ([subscriptionChargeDataset, newDisputeDataset, finalizedDisputeDataset, statsDataset]) => ({
        subscriptionChargeDataset,
        newDisputeDataset,
        finalizedDisputeDataset,
        statsDataset,
      }),
    );

    return this;
  }

  async encryptOwnData(): Promise<EncryptedReconciliationDatasetInterface> {
    return Promise.all([
      this.encryptData(this.data.subscriptionChargeDataset),
      this.encryptData(this.data.newDisputeDataset),
      this.encryptData(this.data.finalizedDisputeDataset),
      this.encryptData(this.data.statsDataset),
    ]).then(
      ([
        encryptedSubscriptionChargeDataSet,
        encryptedNewDisputeDataSet,
        encryptedFinalizedDisputeDataSet,
        encryptedStatDataset,
      ]) => ({
        encryptedSubscriptionChargeDataSet,
        encryptedNewDisputeDataSet,
        encryptedFinalizedDisputeDataSet,
        encryptedStatDataset,
      }),
    );
  }

  compareData(): boolean {
    if (!this.data || !this.partnerData) {
      throw new Error('Data not loaded');
    }
    const subscriptionChargeMismatches: DailyReconciliationMismatch<SubscriptionChargeDatasetInterface>[] =
      CompareDatasetUtils.compareDatasets(
        'subscriptionChargeDataset',
        this.data.subscriptionChargeDataset,
        this.data.subscriptionChargeDataset,
      );
    const newDisputeMismatches: DailyReconciliationMismatch<NewDisputeDatasetInterface>[] =
      CompareDatasetUtils.compareDatasets(
        'newDisputeDataset',
        this.data.newDisputeDataset,
        this.data.newDisputeDataset,
      );
    const finalizedDisputeMismatches: DailyReconciliationMismatch<FinalizedDisputeDatasetInterface>[] =
      CompareDatasetUtils.compareDatasets(
        'finalizedDisputeDataset',
        this.data.finalizedDisputeDataset,
        this.data.finalizedDisputeDataset,
      );
    const statsMismatch: DailyReconciliationMismatch<StatsDatasetInterface>[] =
      CompareDatasetUtils.compareDatasets(
        'statsDataset',
        this.data.statsDataset,
        this.data.statsDataset,
      );
    if (
      subscriptionChargeMismatches.length ||
      newDisputeMismatches.length ||
      finalizedDisputeMismatches.length ||
      statsMismatch
    ) {
      this.dataMismatch = {
        subscriptionCharge: subscriptionChargeMismatches,
        newDispute: newDisputeMismatches,
        finalizedDispute: finalizedDisputeMismatches,
        stats: statsMismatch,
        isMismatched: true,
      };
    }

    return true;
  }

  async resolveConflict(): Promise<boolean> {
    // Resolve conflict
    // update own data
    // update partner data (????)
    // reset conflict data/ owner data/ partner data

    if (this.dataMismatch.isMismatched) {
      if (this.dataMismatch.subscriptionCharge.length) {
        // resolve subscription charge conflict
        this.dataMismatch.subscriptionCharge.forEach(mismatch => {
          if (
            mismatch.type === DailyReconciliationMismatchType.MISSING ||
            mismatch.type === DailyReconciliationMismatchType.REDUNDANT
          ) {
            throw new Error('Not implement resolving for missing and redundant yet');
          }

          if (mismatch.type === DailyReconciliationMismatchType.CONFLICTED) {
            const contract = new SubscriptionChargeContract().fromJWS(
              mismatch.data!.finalizedContract,
            );
            const partnerContract = new SubscriptionChargeContract().fromJWS(
              mismatch.partnerData!.finalizedContract,
            );
            // if 2 contract difference
            // verify 2 contracts
            // choose the correct and latest one
            // compare contract data with extracted data of both mismatch and partner mismatch
            // update the onw data if needed?? but how?
            // What happen if 2 contracts are correct?

            // if 2 contracts are the same
            // compare contract data with extracted data of both mismatch and partner mismatch
          }

          // Todo: the big question is how to update own data?
          // if resolve conflict automatically, how to update partner data?
        });
      }
    }

    return true;
  }

  private async encryptData(data: ReconciliationDataset): Promise<string> {
    // Todo: matching kid and public key
    const contentBuffer = Buffer.from(JSON.stringify(data));

    return new CompactEncrypt(contentBuffer)
      .setProtectedHeader({
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        kid: this.key.kid,
      })
      .encrypt(this.partnerKey.publicKey);
  }

  private async decryptData<T = ReconciliationDataset>(encryptedData: string): Promise<T> {
    // Todo: get kid from encryptedData content
    const { plaintext } = await compactDecrypt(encryptedData, this.key.privateKey);
    const data = JSON.parse(new TextDecoder().decode(plaintext));
    // Todo: validate data

    return data as T;
  }

  // verifyData(data: any): Promise<any>;
  // storeData(data: any): Promise<any>;
}
