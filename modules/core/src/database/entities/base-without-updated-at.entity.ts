import { BaseEntity as TypeOrmBaseEntity, BeforeInsert, CreateDateColumn } from 'typeorm';
import { instanceToPlain } from 'class-transformer';

export default class BaseWithoutUpdatedAtEntity extends TypeOrmBaseEntity {
  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @BeforeInsert()
  setCreateDate(): void {
    this.createdAt = new Date();
  }

  toJSON(): Record<string, any> {
    return instanceToPlain(this);
  }
}
