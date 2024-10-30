import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '@pressingly-modules/core/src/database/entities/base.entity';
import { DailyReconciliationResolutionsAction } from '@pressingly-modules/daily-reconciliation/src/const/daily-reconciliation-resolutions-action';
import { DailyReconciliationMismatchEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation-mismatch.entity';

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

  @Column({ type: 'uuid', nullable: true })
  actionById!: string;

  @OneToOne(() => DailyReconciliationMismatchEntity)
  @JoinColumn({ name: 'reconciliation_mismatch_id' })
  mismatch!: DailyReconciliationMismatchEntity;
}
