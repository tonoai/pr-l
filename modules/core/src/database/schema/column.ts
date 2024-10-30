import { TableColumn } from 'typeorm';
import type { TableColumnOptions } from 'typeorm/schema-builder/options/TableColumnOptions';

export const STRING_LENGTH = 255;
export const STRING_SHORT_LENGTH = 64;
export const STRING_LONG_LENGTH = 512;

export default class Column extends TableColumn {
  static increments(name: string) {
    return new Column({
      name,
      type: 'int',
      isPrimary: true,
      unsigned: true,
      isGenerated: true,
      generationStrategy: 'increment',
    });
  }

  static int(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'int',
      ...options,
    });
  }

  static bigInt(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'bigint',
      ...options,
    });
  }

  static smallInt(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'smallint',
      ...options,
    });
  }

  static float(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'float',
      ...options,
    });
  }

  static boolean(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'bool',
      ...options,
    });
  }

  static text(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'text',
      ...options,
    });
  }

  static longText(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'longtext',
      ...options,
    });
  }

  static string(name: string, length = STRING_LENGTH, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'varchar',
      length: length.toString(),
      ...options,
    });
  }

  static enum(name: string, values: string[], options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'enum',
      enum: values,
      ...options,
    });
  }

  static uuid(name: string = 'uuid') {
    return new Column({
      name,
      type: 'uuid',
      isGenerated: false,
      generationStrategy: 'uuid',
    });
  }

  static json(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'json',
      ...options,
    });
  }

  static jsonb(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'jsonb',
      ...options,
    });
  }

  static array(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'text',
      isArray: true,
      ...options,
    });
  }

  static timestamp(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'timestamp',
      ...options,
    });
  }

  static date(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'date',
      ...options,
    });
  }

  static time(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'time',
      ...options,
    });
  }

  static money(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'decimal',
      precision: 12,
      scale: 2,
      unsigned: true,
      ...options,
    });
  }

  static point(name: string, options?: TableColumnOptions) {
    return new Column({
      name,
      type: 'point',
      ...options,
    });
  }

  nullable() {
    this.isNullable = true;

    return this;
  }

  unique() {
    this.isUnique = true;

    return this;
  }

  setDefault(value: any) {
    this.default = typeof value === 'string' ? `'${value}'` : value;

    return this;
  }

  note(comment: string) {
    this.comment = comment;

    return this;
  }

  setPrimary() {
    this.isPrimary = true;
    this.isGenerated = true;

    return this;
  }
}
