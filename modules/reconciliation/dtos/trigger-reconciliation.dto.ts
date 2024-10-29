import { IsISO8601, IsNotEmpty, IsUUID } from 'class-validator';

export class TriggerReconciliationDto {
  @IsISO8601()
  @IsNotEmpty()
  date!: string;

  @IsUUID('4')
  @IsNotEmpty()
  partnerId!: string;
}
