import * as dayjs from 'dayjs';
import { instanceToPlain } from 'class-transformer';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export abstract class BaseContractPayload {
  constructor() {
    const now = dayjs();
    this.iat = now.unix();
    this.exp = now.add(30, 'minutes').unix();
  }

  @IsUUID('4')
  iss!: string;

  @IsUUID('4')
  aud!: string;

  @IsUUID('4')
  sub!: string;

  @IsNumber()
  iat!: number;

  @IsNumber()
  exp!: number;

  abstract contractType: string;

  @IsString()
  contractVersion = '1.0.0';

  @IsUUID('4')
  contractId!: string;

  toString() {
    return JSON.stringify(instanceToPlain(this));
  }
}
