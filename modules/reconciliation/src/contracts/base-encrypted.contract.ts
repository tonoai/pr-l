import type { KeyObject } from 'crypto';
import type { ClassConstructor } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BaseEncryptedContractPayload } from './base-encrypted.contract-payload';
import { BaseContract } from './base.contract';
import { ContractStatus } from './const/contract-status';
import { KeyInterface } from '../types/key.interface';

export abstract class BaseEncryptedContract<
  T extends BaseEncryptedContractPayload,
> extends BaseContract<T> {
  /**
   * Transform and validate payload,
   * Then decrypt and validate contracts data inside payload,
   * Then verify the signatures
   * @param payloadConstructor
   * @param contractDataConstructor
   * @param privateKey
   * @param getPublicKeyFn
   */
  async transformDecryptAndValidate(
    payloadConstructor: ClassConstructor<T>,
    contractDataConstructor: ClassConstructor<any>,
    privateKey: KeyObject,
    getPublicKeyFn: (kid) => Promise<KeyInterface>,
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

    try {
      await contractPayload.decryptContractData(privateKey);
    } catch (error) {
      this.error = {
        status: ContractStatus.REJECTED,
        message: 'Failed to decrypt contracts data',
      };

      return this;
    }

    this.payload = contractPayload;
    const contractData = plainToInstance(contractDataConstructor, contractPayload.contractDataRaw);
    const dataRawErrors = await validate(contractData, { stopAtFirstError: true });

    if (dataRawErrors.length > 0) {
      this.error = {
        status: ContractStatus.REJECTED,
        message: dataRawErrors[0].toString(true, true, '', true),
      };

      return this;
    }

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
