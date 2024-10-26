import { SubscriptionChargeContractPayload } from './subscription-charge.contract-payload';
import { Type } from 'class-transformer';

export class CreateSubscriptionChargeContractData {
  pinetIdToken!: string;

  subscriptionChargeId!: string;

  amount!: number;

  currencyCode!: string;

  description?: string;

  interchangeFee!: number;

  interchangeRateCode!: string;
}

// eslint-disable-next-line max-len
export class CreateSubscriptionChargeContractPayload extends SubscriptionChargeContractPayload<CreateSubscriptionChargeContractData> {
  @Type(() => CreateSubscriptionChargeContractData)
  contractDataRaw!: CreateSubscriptionChargeContractData;
}
