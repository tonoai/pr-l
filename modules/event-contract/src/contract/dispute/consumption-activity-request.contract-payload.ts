import { IsNotEmpty, IsString } from 'class-validator';
import { BaseContractPayload } from '../base.contract-payload';

export class ConsumptionActivityRequestContractPayload extends BaseContractPayload {
  @IsString()
  @IsNotEmpty()
  contractType = 'ConsumptionActivityRequest';
}
