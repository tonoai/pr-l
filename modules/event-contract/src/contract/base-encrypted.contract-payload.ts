import type { KeyObject } from 'crypto';
import { compactDecrypt, CompactEncrypt } from 'jose';
import { Exclude, instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { BaseContractPayload } from './base.contract-payload';

export abstract class BaseEncryptedContractPayload extends BaseContractPayload {
  @IsUUID('4')
  audKid!: string;

  @IsString()
  @IsNotEmpty()
  contractData!: string;

  @Exclude({ toClassOnly: false, toPlainOnly: true })
  abstract contractDataRaw: any;

  async encryptContractData(publicKey: KeyObject) {
    const plaintext = new TextEncoder().encode(JSON.stringify(this.contractDataRaw));
    this.contractData = await new CompactEncrypt(plaintext)
      .setProtectedHeader({
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
      })
      .encrypt(publicKey);

    return this;
  }

  async decryptContractData(publicKey: KeyObject) {
    const { plaintext } = await compactDecrypt(this.contractData, publicKey);
    this.contractDataRaw = JSON.parse(new TextDecoder().decode(plaintext));

    return this;
  }

  toString() {
    return JSON.stringify(instanceToPlain(this));
  }
}
