import {
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
import { PrinvateKeyInterface, PublicKeyInterface } from './types/key.interface';
import { compactDecrypt, CompactEncrypt } from 'jose';
import { DataBuilderInterface } from './types/data-builder.interface';
import { CompareDatasetUtils } from '@pressingly-modules/reconciliation-builder/src/utils/compare-dataset.utils';
import { DailyReconciliationMismatchType } from '@pressingly-modules/reconciliation-builder/src/types/daily-reconciliation-mismatch.interface';
import { SubscriptionChargeContract } from '@pressingly-modules/event-contract/src/contract/contracts/subscription-charge/subscription-charge.contract';

export interface DataServiceConfigs {
  dataBuilder: DataBuilderInterface;
  myKey: PrinvateKeyInterface;
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
  private myKey: PrinvateKeyInterface;
  private partnerKey: PublicKeyInterface;
  private date: Date;
  private partnerId: string;
  myData!: ReconciliationDatasetInterface;
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
    this.myKey = configs.myKey;
    this.partnerKey = configs.partnerKey;
    this.date = configs.date;
    this.partnerId = configs.partnerId;
  }

  async loadOwnData(): Promise<this> {
    this.myData = await Promise.all([
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

  async loadPartnerData(encryptedData: EncryptedReconciliationDatasetInterface, kid) {
    if (kid !== this.myKey.kid) {
      // for now, only use one key on publisher and membership
      throw new Error('Invalid encrypted kid');
    }
    this.partnerData = await Promise.all([
      this.decryptData<SubscriptionChargeDatasetInterface[]>(
        encryptedData.encryptedSubscriptionChargeDataSet,
        kid,
      ),
      this.decryptData<NewDisputeDatasetInterface[]>(encryptedData.encryptedNewDisputeDataSet, kid),
      this.decryptData<FinalizedDisputeDatasetInterface[]>(
        encryptedData.encryptedFinalizedDisputeDataSet,
        kid,
      ),
      this.decryptData<StatsDatasetInterface>(encryptedData.encryptedStatDataset, kid),
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
      this.encryptData(this.myData.subscriptionChargeDataset),
      this.encryptData(this.myData.newDisputeDataset),
      this.encryptData(this.myData.finalizedDisputeDataset),
      this.encryptData(this.myData.statsDataset),
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
    if (!this.myData || !this.partnerData) {
      throw new Error('Data not loaded');
    }
    const subscriptionChargeMismatches: DailyReconciliationMismatch<SubscriptionChargeDatasetInterface>[] =
      CompareDatasetUtils.compareDatasets(
        'subscriptionChargeDataset',
        this.myData.subscriptionChargeDataset,
        this.myData.subscriptionChargeDataset,
      );
    const newDisputeMismatches: DailyReconciliationMismatch<NewDisputeDatasetInterface>[] =
      CompareDatasetUtils.compareDatasets(
        'newDisputeDataset',
        this.myData.newDisputeDataset,
        this.myData.newDisputeDataset,
      );
    const finalizedDisputeMismatches: DailyReconciliationMismatch<FinalizedDisputeDatasetInterface>[] =
      CompareDatasetUtils.compareDatasets(
        'finalizedDisputeDataset',
        this.myData.finalizedDisputeDataset,
        this.myData.finalizedDisputeDataset,
      );
    const statsMismatch: DailyReconciliationMismatch<StatsDatasetInterface>[] =
      CompareDatasetUtils.compareDatasets(
        'statsDataset',
        this.myData.statsDataset,
        this.myData.statsDataset,
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
    // Todo: matching kid and public myKey
    const contentBuffer = Buffer.from(JSON.stringify(data));

    return new CompactEncrypt(contentBuffer)
      .setProtectedHeader({
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
      })
      .encrypt(this.partnerKey.publicKey);
  }

  private async decryptData<T = ReconciliationDataset>(
    encryptedData: string,
    kid: string,
  ): Promise<T> {
    if (kid !== this.myKey.kid) {
      // noted: this is not a good practice, but for now, we only have one key
      throw new Error('Invalid kid');
    }
    const { plaintext } = await compactDecrypt(encryptedData, this.myKey.privateKey);
    const data = JSON.parse(new TextDecoder().decode(plaintext));
    // Todo: validate data

    return data as T;
  }

  // verifyData(data: any): Promise<any>;
  // storeData(data: any): Promise<any>;
}
