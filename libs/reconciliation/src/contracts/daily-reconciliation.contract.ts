// eslint-disable-next-line max-len
import { DailyReconciliationContractPayload } from './daily-reconciliation.contract-payload';
import { BaseContract } from './base.contract';
import { PublicKeyInterface } from '../types/key.interface';

// Todo:should use base contract from npm package
// eslint-disable-next-line max-len
export class DailyReconciliationContract extends BaseContract<DailyReconciliationContractPayload> {
  public mySignatureIndex = 0;
  public middleSignatureIndex = 1;
  public partnerSignatureIndex = 2;
  public middleSignatureIndex2 = 3;

  async verifyMySignature(getPublicKeyFn: (kid) => Promise<PublicKeyInterface>) {
    const signature = this.getSignature(this.mySignatureIndex);
    const kid = signature?.header?.kid;
    if (!kid) {
      throw new Error('Membership kid is not set in signature header.');
    }
    const key = await getPublicKeyFn(kid);

    return this.verifySingleSignature(key.publicKey, this.mySignatureIndex);
  }

  async verifyMiddleSignature(getPublicKeyFn: (kid) => Promise<PublicKeyInterface>) {
    const signature = this.getSignature(this.middleSignatureIndex);

    const kid = signature?.header?.kid;
    if (!kid) {
      throw new Error('PinetCore kid is not set in signature header.');
    }
    const key = await getPublicKeyFn(kid);

    return this.verifySingleSignature(key.publicKey, this.middleSignatureIndex);
  }

  async verifyPartnerSignature(getPublicKeyFn: (kid) => Promise<PublicKeyInterface>) {
    const signature = this.getSignature(this.middleSignatureIndex);

    const kid = signature?.header?.kid;
    if (!kid) {
      throw new Error('PinetCore kid is not set in signature header.');
    }
    const key = await getPublicKeyFn(kid);

    return this.verifySingleSignature(key.publicKey, this.middleSignatureIndex);
  }

  async verifyMiddleSignature2(getPublicKeyFn: (kid) => Promise<PublicKeyInterface>) {
    const signature = this.getSignature(this.middleSignatureIndex);

    const kid = signature?.header?.kid;
    if (!kid) {
      throw new Error('PinetCore kid is not set in signature header.');
    }
    const key = await getPublicKeyFn(kid);

    return this.verifySingleSignature(key.publicKey, this.middleSignatureIndex);
  }

  async verifySignatures(getPublicKeyFn: (kid) => Promise<PublicKeyInterface>): Promise<this> {
    await Promise.all([
      this.verifyMySignature(getPublicKeyFn),
      this.verifyMiddleSignature(getPublicKeyFn),
      this.verifyPartnerSignature(getPublicKeyFn),
      this.verifyMiddleSignature2(getPublicKeyFn),
    ]);

    return this;
  }
}
