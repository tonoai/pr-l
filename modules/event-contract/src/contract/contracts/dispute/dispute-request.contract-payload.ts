import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import type { JWSHeaderParameters } from 'jose';
import { BaseContractPayload } from '../../base.contract-payload';
import { DisputeContractStatus } from '../../const/dispute-contract-status';

export class DisputeRequestContractPayload extends BaseContractPayload {
  @IsString()
  @IsNotEmpty()
  contractType = 'DisputeRequest';

  @IsOptional()
  @IsUUID('4')
  subscriptionChargeIncrementId!: string;

  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  reason!: string;
}

export interface DisputeResolutionProtectedHeader extends JWSHeaderParameters {
  status: DisputeContractStatus;
  message: string;
  resolvedAt: number;
}

export interface DisputeRequestProtectedHeader extends JWSHeaderParameters {
  status: string;
  message: string;
}
