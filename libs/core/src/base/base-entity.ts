import {
  AfterLoad,
  BaseEntity as TypeOrmBaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, instanceToPlain } from 'class-transformer';

export default class BaseEntity extends TypeOrmBaseEntity {
  @Exclude({ toPlainOnly: true })
  private origin!: Record<string, any>;

  id!: string;

  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @UpdateDateColumn({ select: false })
  updatedAt!: Date;

  @AfterLoad()
  setOrigin() {
    this.origin = instanceToPlain(this);
  }

  getOrigin(): Record<string, any> {
    return this.origin;
  }
}
