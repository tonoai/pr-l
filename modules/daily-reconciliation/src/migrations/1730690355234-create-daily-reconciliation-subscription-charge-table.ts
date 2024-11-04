import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Schema } from '@pressingly-modules/core/src/database/schema/schema';
import Column from '@pressingly-modules/core/src/database/schema/column';

export class CreateDailyReconciliationSubscriptionChargeTable1730690355234
  implements MigrationInterface
{
  private tableName = 'daily_reconciliation_subscription_charges';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      Schema.define(this.tableName, [
        Column.uuid('subscription_charge_id').setPrimary(),
        Column.enum('mismatch_status', ['matched', 'mismatched']),
        Column.enum('clearance_status', ['reconciled', 'unreconciled']),
        Column.timestamp('created_at').setDefault('now()'),
        Column.timestamp('updated_at').setDefault('now()'),
      ]),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(this.tableName, true);
    await queryRunner.query(
      'DROP TYPE daily_reconciliation_subscription_charges_mismatch_status_enum',
    );
    await queryRunner.query(
      'DROP TYPE daily_reconciliation_subscription_charges_clearance_status_enum',
    );
  }
}
