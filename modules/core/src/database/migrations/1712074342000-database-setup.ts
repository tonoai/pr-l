import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DatabaseSetup1712074342000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP EXTENSION IF EXISTS "uuid-ossp";');
  }
}
