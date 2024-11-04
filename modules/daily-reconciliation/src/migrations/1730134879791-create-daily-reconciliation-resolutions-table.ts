import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Schema } from '@pressingly-modules/core/src/database/schema/schema';
import Column from '@pressingly-modules/core/src/database/schema/column';

export class CreateDailyReconciliationResolutionTable1730134879791 implements MigrationInterface {
  private tableName = 'daily_reconciliation_resolutions';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      Schema.define(this.tableName, [
        Column.uuid('id').setPrimary(),
        Column.uuid('reconciliation_mismatch_id'),
        Column.jsonb('original_data').nullable(),
        Column.jsonb('modified_data').nullable(),
        Column.enum('action', ['modify', 'create', 'delete']),
        Column.enum('action_type', ['automatic', 'manual']).setDefault('automatic'),
        Column.uuid('action_by_id').nullable(),
        Column.timestamp('created_at').setDefault('now()'),
        Column.timestamp('updated_at').setDefault('now()'),
      ]),
      true,
    );
    await queryRunner.query(
      `CREATE INDEX idx_${this.tableName}_reconciliation_mismatch_id ON ${this.tableName} (reconciliation_mismatch_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(this.tableName, true);
    await queryRunner.query('DROP TYPE daily_reconciliation_resolutions_action_enum');
  }
}
