import type { FlattenedJWSInput, GeneralJWS, JWSHeaderParameters, SignOptions } from 'jose';
import { FlattenedSign, flattenedVerify } from 'jose';
import type { KeyObject } from 'crypto';
import type { ClassConstructor } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BaseContractPayload } from './base.contract-payload';

export type GeneralJWSSignature = Omit<FlattenedJWSInput, 'payload'>;
export type VerifiedSignature = {
  protectedHeader?: JWSHeaderParameters;
  unprotectedHeader?: JWSHeaderParameters;
};
export type GetPublicKeyFn = ((kid: string) => Promise<KeyObject>) | KeyObject;

export abstract class BaseContract<T extends BaseContractPayload> {
  protected readonly encoder = new TextEncoder();
  protected payload!: T;
  protected signatures: GeneralJWSSignature[] = [];
  protected decodedSignatures: VerifiedSignature[] = [];
  protected uint8ArrayPayload!: Uint8Array;
  protected base64Payload!: string;
  protected jws!: GeneralJWS;
  public errors: any[] = [];
  public abstract totalSignatures: number;

  constructor(data?: T) {
    if (data) {
      this.fromPayload(data);
    }
  }

  static base64Encode(data: string | Uint8Array): string {
    // remove Base64 Padding
    return Buffer.from(data).toString('base64').replace(/=+$/, '');
  }

  fromPayload(payload: T): this {
    this.payload = payload;
    this.uint8ArrayPayload = this.encoder.encode(this.payload.toString());
    this.base64Payload = BaseContract.base64Encode(this.uint8ArrayPayload);
    this.signatures = [];
    this.jws = {
      payload: this.base64Payload,
      signatures: this.signatures,
    };

    return this;
  }

  fromJWS(jws: GeneralJWS): this {
    // initialize only, not transform and validate the payload yet
    // use transformAndValidate method to transform and validate the payload
    this.base64Payload = jws.payload;
    const payloadString = Buffer.from(this.base64Payload, 'base64').toString('utf-8');
    this.payload = JSON.parse(payloadString) as T;
    this.uint8ArrayPayload = this.encoder.encode(payloadString);
    this.signatures = jws.signatures;
    this.signatures.forEach(signature => {
      this.decodedSignatures.push({
        protectedHeader: signature.protected
          ? JSON.parse(Buffer.from(signature.protected, 'base64').toString('utf-8'))
          : undefined,
        unprotectedHeader: signature.header,
      });
    });
    this.jws = jws;

    return this;
  }

  getSignature(index: number): GeneralJWSSignature {
    return this.signatures[index];
  }

  getDecodedSignature(index: number): VerifiedSignature {
    return this.decodedSignatures[index];
  }

  getPayload(): T {
    return this.payload;
  }

  get data(): GeneralJWS {
    return this.jws;
  }

  // Todo: set kid default in header
  async sign(
    key: KeyObject,
    protectedHeader: JWSHeaderParameters = {},
    unprotectedHeader: JWSHeaderParameters = {},
    options?: SignOptions,
  ): Promise<this> {
    if (this.signatures.length >= this.totalSignatures) {
      throw new Error('Cannot sign more than the total number of signatures');
    }
    const flattenedSign = new FlattenedSign(this.uint8ArrayPayload);
    const defaultProtectedHeader: JWSHeaderParameters = {
      alg: 'RS256',
    };
    protectedHeader = {
      ...defaultProtectedHeader,
      ...protectedHeader,
    };

    flattenedSign.setProtectedHeader(protectedHeader);
    if (unprotectedHeader) {
      flattenedSign.setUnprotectedHeader(unprotectedHeader);
    }
    const flattenedJWS = await flattenedSign.sign(key, options);

    this.signatures.push({
      protected: flattenedJWS.protected,
      signature: flattenedJWS.signature,
      header: flattenedJWS.header,
    });
    this.decodedSignatures.push({
      protectedHeader,
      unprotectedHeader,
    });

    return this;
  }

  async verifySingleSignature(
    signatureIndex: number,
    getPublicKeyFn: GetPublicKeyFn,
  ): Promise<this> {
    const signature = this.getSignature(signatureIndex);
    let publicKey: KeyObject;
    if (typeof getPublicKeyFn === 'function') {
      const kid = signature?.header?.kid;
      if (!kid) {
        this.errors.push(`kid is not set in signature ${signatureIndex} header.`);
        throw new Error(`kid is not set in signature ${signatureIndex} header.`);
      }
      publicKey = await getPublicKeyFn(kid);
    } else {
      publicKey = getPublicKeyFn;
    }

    const flattenedJws: FlattenedJWSInput = {
      payload: this.jws.payload,
      header: signature.header,
      protected: signature.protected,
      signature: signature.signature,
    };
    try {
      await flattenedVerify(flattenedJws, publicKey);
    } catch (error) {
      this.errors.push(error);
      throw new Error(`Failed to verify signature ${signatureIndex}`);
    }

    return this;
  }

  /**
   * Verify some first signatures, by order
   * Need to input getPublicKeyFns in order of the signatures
   * @param numberOfSignatures
   * @param getPublicKeyFns
   */
  async verifySomeSignatures(
    numberOfSignatures: number,
    getPublicKeyFns: GetPublicKeyFn[],
  ): Promise<this> {
    const verifySignatures: Promise<this>[] = [];
    for (let i = 0; i < numberOfSignatures; i++) {
      verifySignatures.push(this.verifySingleSignature(i, getPublicKeyFns[i]));
    }
    await Promise.all(verifySignatures);

    return this;
  }

  /**
   * Verify all signatures
   * Need to input getPublicKeyFns in order of the signatures
   * @param getPublicKeyFns
   */
  async verifyAllSignatures(getPublicKeyFns: GetPublicKeyFn[]): Promise<this> {
    const verifySignatures: Promise<this>[] = [];
    for (let i = 0; i < this.totalSignatures; i++) {
      verifySignatures.push(this.verifySingleSignature(i, getPublicKeyFns[i]));
    }
    await Promise.all(verifySignatures);

    return this;
  }

  /**
   * Transform and validate the payload
   * @param payloadConstructor
   */
  async transformAndValidate(payloadConstructor: ClassConstructor<T>): Promise<this> {
    const contractPayload = plainToInstance(payloadConstructor, this.payload);
    const payloadErrors = await validate(contractPayload, { stopAtFirstError: true });
    if (payloadErrors.length > 0) {
      this.errors.push(payloadErrors[0].toString());
      throw new Error('Payload validation failed');
    }

    this.payload = contractPayload;

    return this;
  }
}
