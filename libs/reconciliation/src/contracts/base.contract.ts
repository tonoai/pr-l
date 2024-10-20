import type { FlattenedJWSInput, GeneralJWS, JWSHeaderParameters, SignOptions } from 'jose';
import { FlattenedSign, flattenedVerify, generalVerify } from 'jose';
import { Base64Utils } from '@core/utils/base-64.utils';
import type { KeyObject } from 'crypto';
import type { BaseContractPayload } from '@modules/contracts/base.contracts-payload';
import type { Key } from '@modules/revenue-key/interfaces/key.interface';
import type { ClassConstructor } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ContractStatus } from '@modules/contracts/const/contracts-status';

export type GeneralJWSSignature = Omit<FlattenedJWSInput, 'payload'>;
export type VerifiedSignature = {
  protectedHeader?: JWSHeaderParameters;
  unprotectedHeader?: JWSHeaderParameters;
};

export abstract class BaseContract<T extends BaseContractPayload> {
  protected readonly encoder = new TextEncoder();
  protected payload!: T;
  protected signatures: GeneralJWSSignature[] = [];
  protected decodedSignatures: VerifiedSignature[] = [];
  protected uint8ArrayPayload!: Uint8Array;
  protected base64Payload!: string;
  protected jws!: GeneralJWS;
  public error!: {
    status: string;
    message: string;
  };

  constructor(data?: T) {
    if (data) {
      this.fromPayload(data);
    }
  }

  static base64Encode(data: string | Uint8Array): string {
    // remove Base64 Padding
    return Base64Utils.encode(data).replace(/=+$/, '');
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

  // Todo: set kid default in header
  async sign(
    key: KeyObject | Uint8Array,
    protectedHeader: JWSHeaderParameters = {},
    unprotectedHeader: JWSHeaderParameters = {},
    options?: SignOptions,
  ): Promise<this> {
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

  abstract verifySignatures(...args: any[]): Promise<this>;

  async verifyAnySignature(publicKey: KeyObject): Promise<VerifiedSignature> {
    const { protectedHeader, unprotectedHeader } = await generalVerify(this.jws, publicKey);

    return {
      protectedHeader,
      unprotectedHeader,
    };
  }

  async verifySingleSignature(
    publicKey: KeyObject,
    signatureIndex: number,
  ): Promise<VerifiedSignature> {
    const signature = this.getSignature(signatureIndex);
    const flattenedJws: FlattenedJWSInput = {
      payload: this.jws.payload,
      header: signature.header,
      protected: signature.protected,
      signature: signature.signature,
    };
    const { protectedHeader, unprotectedHeader } = await flattenedVerify(flattenedJws, publicKey);

    return {
      protectedHeader,
      unprotectedHeader,
    };
  }

  get data(): GeneralJWS {
    return this.jws;
  }

  /**
   * Transform and validate the payload
   * Then verify the signatures
   * @param payloadConstructor
   * @param getPublicKeyFn
   */
  async transformAndValidate(
    payloadConstructor: ClassConstructor<T>,
    getPublicKeyFn: (kid) => Promise<Key>,
  ): Promise<this> {
    const contractPayload = plainToInstance(payloadConstructor, this.payload);
    const payloadErrors = await validate(contractPayload, { stopAtFirstError: true });
    if (payloadErrors.length > 0) {
      this.error = {
        status: ContractStatus.REJECTED,
        message: payloadErrors[0].toString(true, true, '', true),
      };

      return this;
    }

    this.payload = contractPayload;

    try {
      await this.verifySignatures(getPublicKeyFn);
    } catch (_error) {
      this.error = {
        status: ContractStatus.REJECTED,
        message: 'Failed to verify signatures',
      };
    }

    return this;
  }
}
