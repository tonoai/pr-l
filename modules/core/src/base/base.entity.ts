import {
  AfterLoad,
  BaseEntity as TypeOrmBaseEntity,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, instanceToPlain } from 'class-transformer';

export default class BaseEntity extends TypeOrmBaseEntity {
  @Exclude({ toPlainOnly: true })
  private origin!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
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
}
