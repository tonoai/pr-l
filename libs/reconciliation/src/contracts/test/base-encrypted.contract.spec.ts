import { generateKeyPairSync } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import type { Key } from '@modules/revenue-key/interfaces/key.interface';
import { BaseEncryptedContractPayload } from '@modules/contracts/base-encrypted.contracts-payload';
import { BaseEncryptedContract } from '@modules/contracts/base-encrypted.contracts';

class TestBaseEncryptedContractPayload extends BaseEncryptedContractPayload {
  contractType = 'TestContract';
  contractDataRaw = 'test';
}

class TestBaseEncryptedContract extends BaseEncryptedContract<TestBaseEncryptedContractPayload> {
  async verifyTestSignature(getPublicKeyFn: (kid) => Promise<Key>, signatureIndex = 0) {
    const publicKey = (await getPublicKeyFn('any')).publicKey;
    await this.verifySingleSignature(publicKey, signatureIndex);

    return this;
  }

  verifySignatures(getPublicKeyFn: (kid) => Promise<Key>): Promise<this> {
    return this.verifyTestSignature(getPublicKeyFn, 0);
  }
}

describe('BaseEncryptedContract', () => {
  let baseEncryptedContract: BaseEncryptedContract<TestBaseEncryptedContractPayload>;
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

  beforeEach(() => {
    baseEncryptedContract = new TestBaseEncryptedContract();
  });

  it('transformDecryptAndValidate: should has error if can not decrypt contracts data', async () => {
    const payload = new TestBaseEncryptedContractPayload();
    payload.iss = uuidv4();
    payload.aud = uuidv4();
    payload.audKid = uuidv4();
    payload.sub = uuidv4();
    payload.contractId = uuidv4();
    await payload.encryptContractData(publicKey);
    baseEncryptedContract.fromPayload(payload);
    await baseEncryptedContract.sign(privateKey);

    const newContract = new TestBaseEncryptedContract().fromJWS(baseEncryptedContract.data);

    // wrong key to decrypt, the right one is privateKey
    await newContract.transformDecryptAndValidate(
      TestBaseEncryptedContractPayload,
      String,
      publicKey,
      async kid =>
        Promise.resolve({
          kid,
          publicKey,
        }),
    );

    expect(newContract.error).toBeDefined();
  });

  it('transformDecryptAndValidate: should has error if contractDataRaw not match DTO', async () => {
    const payload = new TestBaseEncryptedContractPayload();
    payload.iss = uuidv4();
    payload.aud = uuidv4();
    payload.audKid = uuidv4();
    payload.sub = uuidv4();
    payload.contractId = uuidv4();
    await payload.encryptContractData(publicKey);
    baseEncryptedContract.fromPayload(payload);
    await baseEncryptedContract.sign(privateKey);

    const newContract = new TestBaseEncryptedContract().fromJWS(baseEncryptedContract.data);

    await newContract.transformDecryptAndValidate(
      TestBaseEncryptedContractPayload,
      Number,
      privateKey,
      async kid =>
        Promise.resolve({
          kid,
          publicKey,
        }),
    );

    expect(newContract.error).toBeDefined();
  });

  it('transformDecryptAndValidate: should has error if signature not valid or not match with key', async () => {
    const payload = new TestBaseEncryptedContractPayload();
    payload.iss = uuidv4();
    payload.aud = uuidv4();
    payload.audKid = uuidv4();
    payload.sub = uuidv4();
    payload.contractId = uuidv4();
    await payload.encryptContractData(publicKey);
    baseEncryptedContract.fromPayload(payload);
    await baseEncryptedContract.sign(privateKey);

    const newContract = new TestBaseEncryptedContract().fromJWS(baseEncryptedContract.data);

    const { publicKey: publicKey2 } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    await newContract.transformDecryptAndValidate(
      TestBaseEncryptedContractPayload,
      String,
      privateKey,
      async kid =>
        Promise.resolve({
          kid,
          // wrong key here
          publicKey: publicKey2,
        }),
    );

    expect(newContract.error).toBeDefined();
  });
});
