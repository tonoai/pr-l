import type {
  EncryptedReconciliationDatasetInterface,
  FinalizedDisputeDatasetInterface,
  NewDisputeDatasetInterface,
  ReconciliationDataset,
  ReconciliationDatasetInterface,
  ReconciliationDataType,
  ReconciliationMismatchInterface,
  StatsDatasetInterface,
  SubscriptionChargeDatasetInterface,
} from './types/reconciliation-dataset.interface';
import type { PrivateKeyInterface, PublicKeyInterface } from './types/key.interface';
import { compactDecrypt, CompactEncrypt } from 'jose';
import type { DataBuilderInterface } from './types/data-builder.interface';
import { CompareDatasetUtils } from '@pressingly-modules/daily-reconciliation-builder/src/utils/compare-dataset.utils';
import type { DailyReconciliationMismatchInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-mismatch.interface';
import {
  DailyReconciliationMismatchStatus,
  DailyReconciliationMismatchType,
} from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-mismatch.interface';
import type * as dayjs from 'dayjs';
import type { ReconciliationBuilderInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-builder.interface';
import {
  DailyReconciliationResolutionsAction,
  DailyReconciliationResolutionsActionType,
} from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-resolution.interface';
import { v4 as uuidv4 } from 'uuid';

export interface DataServiceConfigs {
  dataBuilder: DataBuilderInterface;
  reconciliationBuilder: ReconciliationBuilderInterface;
  key: PrivateKeyInterface;
  partnerKey: PublicKeyInterface;
  date: dayjs.Dayjs;
  partnerId: string;
  isPrimary?: boolean;
}

export class DataService {
  public readonly dataBuilder: DataBuilderInterface;
  public readonly reconciliationBuilder: ReconciliationBuilderInterface;
  private readonly key: PrivateKeyInterface;
  private readonly partnerKey: PublicKeyInterface;
  private readonly date: dayjs.Dayjs;
  private readonly partnerId: string;
  private readonly isPrimary: boolean;
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
    this.reconciliationBuilder = configs.reconciliationBuilder;
    this.key = configs.key;
    this.partnerKey = configs.partnerKey;
    this.date = configs.date;
    this.partnerId = configs.partnerId;
    this.isPrimary = configs.isPrimary ?? false;
  }

  async loadOwnData(): Promise<this> {
    this.data = await Promise.all([
      this.dataBuilder.getSubscriptionCharges(this.partnerId, this.date.toDate()),
      this.dataBuilder.getNewDisputes(this.partnerId, this.date.toDate()),
      this.dataBuilder.getFinalizedDisputes(this.partnerId, this.date.toDate()),
      this.dataBuilder.getStats(this.partnerId, this.date.toDate()),
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

  async compareData(reconciliationId: string): Promise<boolean> {
    if (!this.data || !this.partnerData) {
      throw new Error('Data not loaded');
    }
    const subscriptionChargeMismatches: Partial<
      DailyReconciliationMismatchInterface<SubscriptionChargeDatasetInterface>
    >[] = CompareDatasetUtils.compareDatasets<SubscriptionChargeDatasetInterface>(
      'subscriptionChargeDataset',
      this.data.subscriptionChargeDataset,
      this.partnerData.subscriptionChargeDataset,
    );
    const newDisputeMismatches: Partial<
      DailyReconciliationMismatchInterface<NewDisputeDatasetInterface>
    >[] = CompareDatasetUtils.compareDatasets<NewDisputeDatasetInterface>(
      'newDisputeDataset',
      this.data.newDisputeDataset,
      this.partnerData.newDisputeDataset,
    );
    const finalizedDisputeMismatches: Partial<
      DailyReconciliationMismatchInterface<FinalizedDisputeDatasetInterface>
    >[] = CompareDatasetUtils.compareDatasets<FinalizedDisputeDatasetInterface>(
      'finalizedDisputeDataset',
      this.data.finalizedDisputeDataset,
      this.partnerData.finalizedDisputeDataset,
    );
    const statsMismatches: Partial<DailyReconciliationMismatchInterface<StatsDatasetInterface>>[] =
      CompareDatasetUtils.compareStats(this.data.statsDataset, this.partnerData.statsDataset);
    if (
      subscriptionChargeMismatches.length ||
      newDisputeMismatches.length ||
      finalizedDisputeMismatches.length ||
      statsMismatches.length
    ) {
      this.dataMismatch = {
        subscriptionCharge: subscriptionChargeMismatches,
        newDispute: newDisputeMismatches,
        finalizedDispute: finalizedDisputeMismatches,
        stats: statsMismatches,
        isMismatched: true,
      };

      const mismatches: DailyReconciliationMismatchInterface<ReconciliationDataType>[] = [];
      Object.values(this.dataMismatch).forEach(value => {
        if (!Array.isArray(value)) {
          return;
        }
        mismatches.push(
          ...value.map(mismatch => {
            // It will add more data to dataMismatch
            mismatch.id = uuidv4();
            mismatch.reconciliationId = reconciliationId;

            return mismatch;
          }),
        );
      });
      await this.reconciliationBuilder.upsertReconciliationMismatches(mismatches);

      return false;
    }

    return true;
  }

  async resolveConflict(): Promise<boolean> {
    // Resolve conflict
    // update own data
    // update partner data (????)
    // reset conflict data/ owner data/ partner data

    if (this.dataMismatch.isMismatched) {
      if (this.isPrimary) {
        // no need to resolve conflict
        // when you are primary, you are always right
        return false;
      }
      // Todo: no solution to resolve conflict for stats
      if (this.dataMismatch.subscriptionCharge.length) {
        // resolve subscription charge conflict
        for (const mismatch of this.dataMismatch.subscriptionCharge) {
          if (mismatch.type === DailyReconciliationMismatchType.MISSING) {
            // Todo should return original data here
            // Todo: should wrap this in a transaction
            await this.reconciliationBuilder.upsertReconciliationResolution({
              reconciliationMismatchId: mismatch.id,
              originalData: mismatch.data!,
              action: DailyReconciliationResolutionsAction.DELETE,
              actionType: DailyReconciliationResolutionsActionType.AUTOMATIC,
              // actionById: SYSTEM_DEFAULT_UUID,
            });
            await this.dataBuilder.deleteSubscriptionCharge(this.partnerId, mismatch.data!);
            await this.reconciliationBuilder.upsertReconciliationMismatches([
              {
                id: mismatch.id,
                status: DailyReconciliationMismatchStatus.RESOLVED,
              },
            ]);
            mismatch.status = DailyReconciliationMismatchStatus.RESOLVED;

            continue;
          }

          if (mismatch.type === DailyReconciliationMismatchType.REDUNDANT) {
            await this.reconciliationBuilder.upsertReconciliationResolution({
              reconciliationMismatchId: mismatch.id,
              modifiedData: mismatch.partnerData!,
              action: DailyReconciliationResolutionsAction.CREATE,
              actionType: DailyReconciliationResolutionsActionType.AUTOMATIC,
              // actionById: SYSTEM_DEFAULT_UUID,
            });
            await this.dataBuilder.createSubscriptionCharge(this.partnerId, mismatch.partnerData!);
            await this.reconciliationBuilder.upsertReconciliationMismatches([
              {
                id: mismatch.id,
                status: DailyReconciliationMismatchStatus.RESOLVED,
              },
            ]);
            mismatch.status = DailyReconciliationMismatchStatus.RESOLVED;

            continue;
          }

          if (mismatch.type === DailyReconciliationMismatchType.CONFLICTED) {
            // Todo: verify 2 contracts before action
            // const contract = new SubscriptionChargeContract().fromJWS(
            //   mismatch.data!.finalizedContract,
            // );
            // const partnerContract = new SubscriptionChargeContract().fromJWS(
            //   mismatch.partnerData!.finalizedContract,
            // );
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
          await this.reconciliationBuilder.upsertReconciliationResolution({
            reconciliationMismatchId: mismatch.id,
            originalData: mismatch.data!,
            modifiedData: mismatch.partnerData!,
            action: DailyReconciliationResolutionsAction.MODIFY,
            actionType: DailyReconciliationResolutionsActionType.AUTOMATIC,
            // actionById: SYSTEM_DEFAULT_UUID,
          });
          await this.dataBuilder.updateSubscriptionCharge(this.partnerId, mismatch.partnerData!);
          await this.reconciliationBuilder.upsertReconciliationMismatches([
            {
              id: mismatch.id,
              status: DailyReconciliationMismatchStatus.RESOLVED,
            },
          ]);
          mismatch.status = DailyReconciliationMismatchStatus.RESOLVED;
        }
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
