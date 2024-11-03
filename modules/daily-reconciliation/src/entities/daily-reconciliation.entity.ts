import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Nullable } from '@pressingly-modules/core/src/types/common.type';
import BaseEntity from '@pressingly-modules/core/src/database/entities/base.entity';
import { PinetContract } from '@pressingly-modules/event-contract/src/events/pinet-event';
import { STRING_LENGTH } from '@pressingly-modules/core/src/database/schema/column';
import { DailyReconciliationMismatchEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation-mismatch.entity';
import { ColumnNumericTransformer } from '../../../../../src/core/database/column-numeric-transformer';
import { DailyReconciliationStatus } from '@pressingly-modules/daily-reconciliation-builder/src/types/daily-reconciliation.interface';

@Entity('daily_reconciliations')
export class DailyReconciliationEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  partnerId!: string;

  @Column({ type: 'timestamp' })
  date!: Date;

  @Column({ type: 'uuid', nullable: true })
  attachmentId!: string;

  @Column({ type: 'uuid', nullable: true })
  partnerAttachmentId!: string;

  @Column({
    type: 'enum',
    enum: DailyReconciliationStatus,
    default: DailyReconciliationStatus.PROCESSING,
  })
  status!: DailyReconciliationStatus;

  @Column('decimal', { precision: 12, scale: 2, transformer: new ColumnNumericTransformer() })
  totalAmount!: number;

  @Column('decimal', { precision: 12, scale: 2, transformer: new ColumnNumericTransformer() })
  totalInterchangeFee!: number;

  @Column({ type: 'varchar', length: 6 })
  currencyCode!: string;

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
