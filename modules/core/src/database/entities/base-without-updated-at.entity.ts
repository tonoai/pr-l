import { AfterLoad, BaseEntity as TypeOrmBaseEntity, BeforeInsert, Column, CreateDateColumn } from 'typeorm';
import { Exclude, instanceToPlain } from 'class-transformer';

export default class BaseWithoutUpdatedAtEntity extends TypeOrmBaseEntity {
  @Exclude({ toPlainOnly: true })
  @Column({ select: false, update: false, insert: false, nullable: true, type: 'json' })
  private origin!: Record<string, any>;

  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @BeforeInsert()
  setCreateDate(): void {
    this.createdAt = new Date();
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
