import type { KeyObject } from 'crypto';
import type { ClassConstructor } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BaseEncryptedContractPayload } from './base-encrypted.contract-payload';
import { BaseContract } from './base.contract';

export abstract class BaseEncryptedContract<
  T extends BaseEncryptedContractPayload,
> extends BaseContract<T> {
  /**
   * Transform and validate payload,
   * Then decrypt and validate contract data inside payload,
   * @param payloadConstructor
   * @param contractDataConstructor
   * @param privateKey
   */
  async transformDecryptAndValidate(
    payloadConstructor: ClassConstructor<T>,
    contractDataConstructor: ClassConstructor<any>,
    privateKey: KeyObject,
  ): Promise<this> {
    const contractPayload = plainToInstance(payloadConstructor, this.payload);
    const payloadErrors = await validate(contractPayload, { stopAtFirstError: true });
    if (payloadErrors.length > 0) {
      this.errors.push(payloadErrors[0].toString());
      throw new Error(`Payload validation failed: ${payloadErrors[0].toString()}`);
    }

    try {
      await contractPayload.decryptContractData(privateKey);
    } catch (error) {
      this.errors.push(error);
      throw new Error('Failed to decrypt contract data');
    }

    this.payload = contractPayload;
    const contractData = plainToInstance(contractDataConstructor, contractPayload.contractDataRaw);
    const dataRawErrors = await validate(contractData, { stopAtFirstError: true });

    if (dataRawErrors.length > 0) {
      this.errors.push(dataRawErrors[0].toString());
      throw new Error(`Contract data validation failed: ${dataRawErrors[0].toString()}`);
    }

    return this;
  }
}
