import { Column, Entity, PrimaryColumn } from 'typeorm';
import BaseEntity from '@pressingly-modules/core/src/database/entities/base.entity';
import {
  DailyReconciliationSubscriptionChargeClearanceStatus,
  DailyReconciliationSubscriptionChargeMismatchStatus,
} from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-subscription-charge.interface';

@Entity('daily_reconciliation_subscription_charges')
export class DailyReconciliationSubscriptionChargesEntity extends BaseEntity {
  @PrimaryColumn('uuid')
  subscriptionChargeId!: string;

  @Column({
    type: 'enum',
    enum: DailyReconciliationSubscriptionChargeMismatchStatus,
  })
  mismatchStatus!: DailyReconciliationSubscriptionChargeMismatchStatus;

  @Column({
    type: 'enum',
    enum: DailyReconciliationSubscriptionChargeClearanceStatus,
  })
  clearanceStatus!: DailyReconciliationSubscriptionChargeClearanceStatus;
}
