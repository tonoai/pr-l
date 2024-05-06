import { TableColumn } from 'typeorm';

export const STRING_LENGTH = 255;
export const STRING_SHORT_LENGTH = 64;
export const STRING_LONG_LENGTH = 512;
export default class Column extends TableColumn {
  static integer(name) {
    return new Column({
      name,
      type: 'int',
    });
  }

  static email(name = 'email') {
    return new Column({
      name,
      type: 'varchar',
      length: STRING_LENGTH.toString(),
    });
  }

  static phone(name = 'phone') {
    return new Column({
      name,
      type: 'varchar',
      length: STRING_SHORT_LENGTH.toString(),
    });
  }

  static increments(name) {
    return new Column({
      name,
      type: 'int',
      isPrimary: true,
      unsigned: true,
      isGenerated: true,
      generationStrategy: 'increment',
    });
  }

  static bigInt(name) {
    return new Column({
      name,
      type: 'bigint',
      isPrimary: true,
      unsigned: true,
      isGenerated: true,
      generationStrategy: 'increment',
    });
  }

  static unsigned(name) {
    return new Column({
      name,
      type: 'int',
      unsigned: true,
    });
  }

  static float(name) {
    return new Column({
      name,
      type: 'float',
    });
  }

  static boolean(name: string, defaultValue?: boolean) {
    return new Column({
      name,
      type: 'bool',
      default: defaultValue,
    });
  }

  static text(name) {
    return new Column({
      name,
      type: 'text',
    });
  }

  static any(name) {
    return new Column({
      name,
      type: 'text',
    });
  }

  static longText(name) {
    return new Column({
      name,
      type: 'longtext',
    });
  }

  static string(name, length = STRING_LENGTH) {
    return new Column({
      name,
      type: 'varchar',
      length: length.toString(),
    });
  }

  static enum(name: string, values: any) {
    return new Column({
      name,
      type: 'enum',
      enum: Object.values(values),
    });
  }

  static status(name: string, values: string[], defaultValue?: string) {
    const column = Column.enum(name, values);

    return defaultValue ? column.setDefault(defaultValue) : column;
  }

  static uuid(name = 'uuid') {
    return new Column({
      name,
      type: 'uuid',
      isGenerated: false,
      generationStrategy: 'uuid',
    });
  }

  static version(name = 'version') {
    return new Column({
      name,
      type: 'int',
    });
  }

  static json(name: string) {
    return new Column({
      name,
      type: 'json',
    });
  }

  static jsonb(name: string) {
    return new Column({
      name,
      type: 'jsonb',
    });
  }

  static array(name: string) {
    return new Column({
      name,
      type: 'text',
      isArray: true,
    });
  }

  static timestamp(name) {
    return new Column({
      name,
      type: 'timestamp',
    });
  }

  static date(name) {
    return new Column({
      name,
      type: 'date',
    });
  }

  static time(name) {
    return new Column({
      name,
      type: 'time',
    });
  }

  static money(name) {
    return new Column({
      name,
      type: 'decimal',
      precision: 12,
      scale: 2,
      unsigned: true,
    });
  }

  static virtual(name, express: string) {
    return new Column({
      name,
      type: 'json',
      asExpression: express,
      generatedType: 'VIRTUAL',
      isGenerated: true,
      generationStrategy: undefined,
    });
  }

  static percentage(name) {
    return new Column({
      name,
      type: 'decimal',
      precision: 3,
      scale: 2,
    });
  }

  static point(name) {
    return new Column({
      name,
      type: 'point',
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

  setDefault(value) {
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
