import { QueryRunner, Table } from 'typeorm';

export class Schema {
  static define(table, columns): Table {
    return new Table({
      name: table,
      columns,
    });
  }

  static async create(table, columns, queryRunner: QueryRunner, ifNotExist = true) {
    await queryRunner.createTable(
      new Table({
        name: table,
        columns,
      }),
      ifNotExist,
    );
  }
}
