import { SubscriptionChargeContractPayload } from './subscription-charge.contract-payload';
import { Type } from 'class-transformer';

export class FinalizeSubscriptionChargeContractData {
  pinetIdToken!: string;

  subscriptionChargeId!: string;

  amount!: number;

  currencyCode!: string;

  description?: string;

  finalizedAt!: number;

  interchangeFee!: number;
}

// eslint-disable-next-line max-len
export class FinalizeSubscriptionChargeContractPayload extends SubscriptionChargeContractPayload<FinalizeSubscriptionChargeContractData> {
  @Type(() => FinalizeSubscriptionChargeContractData)
  contractDataRaw!: FinalizeSubscriptionChargeContractData;
}
