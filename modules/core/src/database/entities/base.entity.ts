import {
  AfterLoad,
  BaseEntity as TypeOrmBaseEntity,
  BeforeInsert,
  BeforeUpdate,
  // Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, instanceToPlain } from 'class-transformer';

export default class BaseEntity extends TypeOrmBaseEntity {
  @Exclude({ toPlainOnly: true })
  // TODO: this column is not in use
  // @Column({ select: false, update: false, insert: false, nullable: true, type: 'json' })
  private origin!: Record<string, any>;

  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @UpdateDateColumn({ select: false })
  updatedAt!: Date;

  @BeforeInsert()
  setCreateDate(): void {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  setUpdateDate(): void {
    this.updatedAt = new Date();
  }

  @AfterLoad()
  setOrigin() {
    this.origin = instanceToPlain(this);
  }

  getOrigin(): Record<string, any> {
    return this.origin;
  }

  toJSON(): Record<string, any> {
    return instanceToPlain(this);
  }
}
