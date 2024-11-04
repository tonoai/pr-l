import {
  BaseEntity as TypeOrmBaseEntity,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { instanceToPlain } from 'class-transformer';

export default class BaseEntity extends TypeOrmBaseEntity {
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

  toJSON(): Record<string, any> {
    return instanceToPlain(this);
  }
}
