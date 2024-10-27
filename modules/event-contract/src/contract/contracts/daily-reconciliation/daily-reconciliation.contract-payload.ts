import { IsISO8601, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import type { JWSHeaderParameters } from 'jose';
import { Type } from 'class-transformer';
import { BaseContractPayload } from '@pressingly-modules/event-contract/src/contract/base.contract-payload';

export class Stats {
  @IsNumber()
  totalSubscriptionChargeAmount!: Record<string, number>;

  @IsNumber()
  totalInterchangeFee!: Record<string, number>;

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

  constructor(data?: Partial<DailyReconciliationContractPayload>) {
    super();
    Object.assign(this, data);
  }
}

export interface DailyReconciliationResponseProtectedHeader extends JWSHeaderParameters {
  status: 'reconciled' | 'failed';
}
