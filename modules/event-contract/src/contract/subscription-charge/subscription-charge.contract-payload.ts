import { BaseEncryptedContractPayload } from '../base-encrypted.contract-payload';

export class SubscriptionChargeContractPayload<T> extends BaseEncryptedContractPayload {
  contractType = 'SubscriptionChargeRequest';

  contractDataRaw!: T;
}
