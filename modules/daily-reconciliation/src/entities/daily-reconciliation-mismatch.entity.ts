import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Nullable } from '@pressingly-modules/core/src/types/common.type';
import {
  type DailyReconciliationMismatchInterface,
  DailyReconciliationMismatchRefType,
  DailyReconciliationMismatchStatus,
  DailyReconciliationMismatchType,
} from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-mismatch.interface';
import { DailyReconciliationEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation.entity';
import BaseEntity from '@pressingly-modules/core/src/database/entities/base.entity';
import { ReconciliationDataType } from '@pressingly-modules/daily-reconciliation-builder/src/types/reconciliation-dataset.interface';

@Entity('daily_reconciliation_mismatches')
export class DailyReconciliationMismatchEntity
  extends BaseEntity
  implements DailyReconciliationMismatchInterface<ReconciliationDataType>
{
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  reconciliationId!: string;

  @Column({ type: 'uuid', nullable: true })
  refId!: string;

  @Column({
    type: 'enum',
    enum: DailyReconciliationMismatchRefType,
  })
  refType!: DailyReconciliationMismatchRefType;

  @Column({ type: 'jsonb', nullable: true })
  data!: ReconciliationDataType;

  @Column({ type: 'jsonb', nullable: true })
  partnerData!: ReconciliationDataType;

  @Column({
    type: 'enum',
    enum: DailyReconciliationMismatchType,
  })
  type!: DailyReconciliationMismatchType;

  @Column({
    type: 'enum',
    enum: DailyReconciliationMismatchStatus,
  })
  status!: DailyReconciliationMismatchStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  message!: Nullable<string>;

  @ManyToOne(() => DailyReconciliationEntity, dispute => dispute.mismatches)
  @JoinColumn({
    name: 'reconciliation_id',
    foreignKeyConstraintName: 'fk_daily_reconciliation_mismatches_reconciliation_id',
  })
  @Index('idx_daily_reconciliation_mismatches_reconciliation_id')
  reconciliation!: DailyReconciliationEntity;
}
