import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Schema } from '@pressingly-modules/core/src/database/schema/schema';
import Column, { STRING_LENGTH } from '@pressingly-modules/core/src/database/schema/column';

export class CreateDailyReconciliationTable1730131783789 implements MigrationInterface {
  private tableName = 'daily_reconciliations';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      Schema.define(this.tableName, [
        Column.uuid('id').setPrimary(),
        Column.uuid('partner_id'),
        Column.timestamp('date').setDefault('now()'),
        Column.uuid('attachment_id').nullable(),
        Column.uuid('partner_attachment_id').nullable(),
        Column.enum('status', ['processing', 'reconciled', 'unreconciled', 'failed']).setDefault(
          'processing',
        ),
        Column.money('total_amount'),
        Column.money('total_interchange_fee'),
        Column.string('currency_code', 6),
        Column.string('message', STRING_LENGTH).nullable(),
        Column.jsonb('contract'),
        Column.timestamp('issued_at'),
        Column.timestamp('reconciled_at').nullable(),
        Column.timestamp('created_at').setDefault('now()'),
        Column.timestamp('updated_at').setDefault('now()'),
      ]),
      true,
    );
    await queryRunner.query(
      `CREATE INDEX idx_${this.tableName}_partner_id ON ${this.tableName} (partner_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(this.tableName, true);
    await queryRunner.query('DROP TYPE daily_reconciliations_status_enum');
  }
}
