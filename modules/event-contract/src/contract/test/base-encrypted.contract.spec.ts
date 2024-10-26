import { generateKeyPairSync } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { BaseEncryptedContractPayload } from '../base-encrypted.contract-payload';
import { BaseEncryptedContract } from '../base-encrypted.contract';

class TestBaseEncryptedContractPayload extends BaseEncryptedContractPayload {
  contractType = 'TestContract';
  contractDataRaw = 'test';
}

class TestBaseEncryptedContract extends BaseEncryptedContract<TestBaseEncryptedContractPayload> {
  totalSignatures = 1;
}

describe('BaseEncryptedContract', () => {
  let baseEncryptedContract: BaseEncryptedContract<TestBaseEncryptedContractPayload>;
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

  beforeEach(() => {
    baseEncryptedContract = new TestBaseEncryptedContract();
  });

  describe('transformDecryptAndValidate', () => {
    it('transformDecryptAndValidate: successfully', async () => {
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
        String,
        privateKey,
      );

      expect(newContract.errors.length).toEqual(0);
    });

    it('transformDecryptAndValidate: should throw error if invalid payload', async () => {
      const payload = new TestBaseEncryptedContractPayload();
      payload.iss = uuidv4();
      payload.aud = uuidv4();
      payload.audKid = uuidv4();
      payload.sub = uuidv4();
      await payload.encryptContractData(publicKey);
      baseEncryptedContract.fromPayload(payload);
      await baseEncryptedContract.sign(privateKey);

      const newContract = new TestBaseEncryptedContract().fromJWS(baseEncryptedContract.data);

      // wrong key to decrypt, the right one is privateKey
      await expect(
        newContract.transformDecryptAndValidate(
          TestBaseEncryptedContractPayload,
          String,
          publicKey,
        ),
      ).rejects.toThrow();

      expect(newContract.errors.length).toEqual(1);
    });

    // eslint-disable-next-line max-len
    it('transformDecryptAndValidate: should throw error if can not decrypt contract data', async () => {
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
      await expect(
        newContract.transformDecryptAndValidate(
          TestBaseEncryptedContractPayload,
          String,
          publicKey,
        ),
      ).rejects.toThrow();

      expect(newContract.errors.length).toEqual(1);
    });

    // eslint-disable-next-line max-len
    it('transformDecryptAndValidate: should throw error if contractDataRaw not match DTO', async () => {
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

      await expect(
        newContract.transformDecryptAndValidate(
          TestBaseEncryptedContractPayload,
          Number,
          privateKey,
        ),
      ).rejects.toThrow();

      expect(newContract.errors.length).toEqual(1);
    });
  });
});
