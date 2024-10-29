import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Nullable } from '@pressingly-modules/core/src/types/common.type';
import BaseEntity from '@pressingly-modules/core/src/database/entities/base.entity';
import { PinetContract } from '@pressingly-modules/event-contract/src/events/pinet-event';
import {
  STRING_LENGTH,
  STRING_LONG_LENGTH,
} from '@pressingly-modules/core/src/database/schema/column';
import { DailyReconciliationStatus } from '@pressingly-modules/reconciliation/const/daily-reconciliation-status';
import { DailyReconciliationMismatchEntity } from '@pressingly-modules/reconciliation/entities/daily-reconciliation-mismatch.entity';

@Entity('daily_reconciliations')
export class DailyReconciliationEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  partnerId!: string;

  @Column({ type: 'timestamp' })
  date!: Date;

  @Column({ type: 'varchar', length: STRING_LONG_LENGTH, nullable: true })
  fileUrl!: string;

  @Column({ type: 'varchar', length: STRING_LONG_LENGTH, nullable: true })
  partnerFileUrl!: string;

  @Column({
    type: 'enum',
    enum: DailyReconciliationStatus,
    default: DailyReconciliationStatus.PROCESSING,
  })
  status!: DailyReconciliationStatus;

  @Column({ type: 'varchar', length: STRING_LENGTH, nullable: true })
  message!: string;

  @Column({ type: 'jsonb' })
  contract!: PinetContract;

  @Column({ type: 'timestamp' })
  issuedAt!: Date;

  @Column({ type: 'timestamp' })
  reconciledAt!: Nullable<Date>;

  @OneToMany(() => DailyReconciliationMismatchEntity, entity => entity.reconciliation)
  mismatches!: DailyReconciliationMismatchEntity[];
}
