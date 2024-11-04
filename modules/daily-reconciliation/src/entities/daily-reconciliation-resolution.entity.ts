import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '@pressingly-modules/core/src/database/entities/base.entity';
import { DailyReconciliationMismatchEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation-mismatch.entity';
import {
  DailyReconciliationResolutionsAction,
  DailyReconciliationResolutionsActionType,
} from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-resolution.interface';
import { Nullable } from '@pressingly-modules/core/src/types/common.type';

@Entity('daily_reconciliation_resolutions')
export class DailyReconciliationResolutionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  reconciliationMismatchId!: string;

  @Column({ type: 'jsonb', nullable: true })
  originalData!: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  modifiedData!: Record<string, any>;

  @Column({
    type: 'enum',
    enum: DailyReconciliationResolutionsAction,
  })
  action!: DailyReconciliationResolutionsAction;

  @Column({
    type: 'enum',
    enum: DailyReconciliationResolutionsActionType,
    default: DailyReconciliationResolutionsActionType.AUTOMATIC,
  })
  actionType!: DailyReconciliationResolutionsActionType;

  @Column({ type: 'uuid', nullable: true })
  actionById!: Nullable<string>;

  @OneToOne(() => DailyReconciliationMismatchEntity)
  @JoinColumn({ name: 'reconciliation_mismatch_id' })
  mismatch!: DailyReconciliationMismatchEntity;
}
