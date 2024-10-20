import { Injectable } from '@nestjs/common';
import {
  FinalizedDisputeDatasetInterface,
  NewDisputeDatasetInterface,
  SubscriptionChargeDatasetInterface,
} from './types/data-builder.interface';
import { KeyObject } from 'crypto';
import { KeyInterface } from './types/key.interface';
import * as fs from 'node:fs';
import { compactDecrypt, CompactEncrypt } from 'jose';

@Injectable()
export abstract class FileService {
  constructor(
    private privateKey: KeyObject,
    private partnerKey: KeyInterface,
  ) {}

  async encryptThenSaveFile(
    data:
      | SubscriptionChargeDatasetInterface[]
      | NewDisputeDatasetInterface[]
      | FinalizedDisputeDatasetInterface[],
  ): Promise<string> {
    const jwe = await new CompactEncrypt(new TextEncoder().encode(data.toString()))
      .setProtectedHeader({
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        kid: this.partnerKey.kid,
      })
      .encrypt(this.partnerKey.publicKey);

    //Todo: define the path to save the encrypted file
    const encryptedFilePath = 'path/to/encrypted.jwe';
    fs.writeFileSync(encryptedFilePath, jwe, 'utf-8');

    return encryptedFilePath;
  }

  async decryptData(jwe: string): Promise<T> {
    // Todo: need to load private key matching the public key used to encrypt the data (kid)
    const { plaintext } = await compactDecrypt(jwe, this.privateKey);
    const data = JSON.parse(new TextDecoder().decode(plaintext));
    // Todo: validate data

    return data as T;
  }
}
