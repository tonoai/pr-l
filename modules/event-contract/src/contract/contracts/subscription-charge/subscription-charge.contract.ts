// eslint-disable-next-line max-len
import type { CreateSubscriptionChargeContractPayload } from './create-subscription-charge.contract-payload';
// eslint-disable-next-line max-len
import type { FinalizeSubscriptionChargeContractPayload } from './finalize-subscription-charge.contract-payload';
import { BaseEncryptedContract } from '../../base-encrypted.contract';

export class SubscriptionChargeContract<
  T extends CreateSubscriptionChargeContractPayload | FinalizeSubscriptionChargeContractPayload,
> extends BaseEncryptedContract<T> {
  public publisherSignatureIndex = 0;
  public firstPinetCoreSignatureIndex = 1;
  public membershipSignatureIndex = 2;
  public secondPinetCoreSignatureIndex = 3;
  public totalSignatures = 4;
}
