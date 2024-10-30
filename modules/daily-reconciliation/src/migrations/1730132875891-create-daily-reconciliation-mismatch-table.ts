import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Schema } from '@pressingly-modules/core/src/database/schema/schema';
import Column, { STRING_LENGTH } from '@pressingly-modules/core/src/database/schema/column';

export class CreateDailyReconciliationMismatchTable1730132875891 implements MigrationInterface {
  private tableName = 'daily_reconciliation_mismatches';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      Schema.define(this.tableName, [
        Column.uuid('id').setPrimary(),
        Column.uuid('reconciliation_id'),
        Column.uuid('ref_id').nullable(),
        Column.enum('ref_type', [
          'finalizedSubscriptionCharge',
          'newDispute',
          'finalizedDispute',
          'stats',
        ]),
        Column.jsonb('data').nullable(),
        Column.jsonb('partner_data').nullable(),
        Column.enum('type', ['conflicted', 'missing', 'redundant']),
        Column.enum('status', ['pending', 'resolved']),
        Column.string('message', STRING_LENGTH).nullable(),
        Column.string('note', STRING_LENGTH).nullable(),
        Column.uuid('resolved_by_id').nullable(),
        Column.timestamp('created_at').setDefault('now()'),
        Column.timestamp('updated_at').setDefault('now()'),
      ]),
      true,
    );
    await queryRunner.query(
      `CREATE INDEX idx_${this.tableName}_reconciliation_id ON ${this.tableName} (reconciliation_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(this.tableName, true);
    await queryRunner.query('DROP TYPE daily_reconciliation_mismatches_ref_type_enum');
    await queryRunner.query('DROP TYPE daily_reconciliation_mismatches_type_enum');
    await queryRunner.query('DROP TYPE daily_reconciliation_mismatches_status_enum');
  }
}
