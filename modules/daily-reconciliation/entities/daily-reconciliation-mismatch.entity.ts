import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Nullable } from '@pressingly-modules/core/src/types/common.type';
import {
  DailyReconciliationMismatchRefType,
  DailyReconciliationMismatchStatus,
  DailyReconciliationMismatchType,
} from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation-mismatch.interface';
import { DailyReconciliationEntity } from '@pressingly-modules/daily-reconciliation/entities/daily-reconciliation.entity';
import BaseEntity from '@pressingly-modules/core/src/database/entities/base.entity';

@Entity('daily_reconciliation_mismatches')
export class DailyReconciliationMismatchEntity extends BaseEntity {
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
  data!: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  partnerData!: Record<string, any>;

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

  @Column({ type: 'varchar', length: 255, nullable: true })
  note!: Nullable<string>;

  @Column({ type: 'uuid', nullable: true })
  resolvedById!: string;

  @ManyToOne(() => DailyReconciliationEntity, dispute => dispute.mismatches)
  reconciliation!: DailyReconciliationEntity;
}
