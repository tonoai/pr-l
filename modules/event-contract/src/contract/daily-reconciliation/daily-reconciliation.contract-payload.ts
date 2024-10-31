import { IsISO8601, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import type { JWSHeaderParameters } from 'jose';
import { Type } from 'class-transformer';
import { BaseContractPayload } from '@pressingly-modules/event-contract/src/contract/base.contract-payload';

export class Stats {
  @IsNumber()
  totalSubscriptionChargeAmount!: number;

  @IsNumber()
  totalInterchangeFee!: number;

  @IsNumber()
  newDisputeCount!: number;
}

export class DailyReconciliationContractPayload extends BaseContractPayload {
  @IsString()
  @IsNotEmpty()
  contractType = 'DailyReconciliation';

  @IsISO8601()
  date!: string;

  // Todo: double check: stats in contract or in compare data?
  @ValidateNested()
  @Type(() => Stats)
  stats!: Stats;
  //
  // @IsUUID('4')
  // fileId!: string;

  constructor(data?: Partial<DailyReconciliationContractPayload>) {
    super();
    Object.assign(this, data);
  }
}

export enum DailyReconciliationResolveStatus {
  RECONCILED = 'reconciled',
  FAILED = 'failed',
}

export interface DailyReconciliationResolveProtectedHeader extends JWSHeaderParameters {
  status: DailyReconciliationResolveStatus;
  reconciledAt?: number;
  message?: string;
}
