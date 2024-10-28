import { generateKeyPairSync } from 'crypto';
import { BaseContract } from '../base.contract';
import type { GeneralJWS } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { BaseContractPayload } from '../base.contract-payload';
import { Base64Utils } from '../../utils/base-64.utils';

class TestBaseContractPayload extends BaseContractPayload {
  contractType = 'TestContract';
}

class TestBaseContract extends BaseContract<TestBaseContractPayload> {
  totalSignatures = 2;
}

describe('BaseContract', () => {
  let baseContract: BaseContract<TestBaseContractPayload>;
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const { publicKey: publicKey2, privateKey: _privateKey2 } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  beforeEach(() => {
    baseContract = new TestBaseContract();
  });

  it('should initialize with payload', () => {
    const payload = new TestBaseContractPayload();
    const contract = new TestBaseContract(payload);
    expect(contract.getPayload()).toEqual(payload);
  });

  it('should init contract from payload successfully', () => {
    const payload = new TestBaseContractPayload();
    baseContract.fromPayload(payload);

    expect(baseContract.getPayload()).toEqual(payload);
    expect(baseContract.data).toEqual({
      payload: Base64Utils.encodeAndRemovePadding(payload.toString()),
      signatures: [],
    });
  });

  it('should correctly set properties from JWS', () => {
    const payload = new TestBaseContractPayload();
    const jws: GeneralJWS = {
      payload: Buffer.from(JSON.stringify(payload)).toString('base64'),
      signatures: [],
    };

    baseContract.fromJWS(jws);

    expect(baseContract.data).toEqual(jws);
    expect(baseContract.getPayload()).toEqual(payload);
  });

  it('should decode signature from JWS', () => {
    const payload = new TestBaseContractPayload();
    const jws: GeneralJWS = {
      payload: Buffer.from(JSON.stringify(payload)).toString('base64'),
      signatures: [
        {
          signature: 'test',
          header: {},
        },
      ],
    };

    baseContract.fromJWS(jws);

    expect(baseContract.data).toEqual(jws);
    expect(baseContract.getDecodedSignature(0)).toBeDefined();
  });

  it('should get signature from list of signatures', async () => {
    const payload = new TestBaseContractPayload();
    baseContract.fromPayload(payload);
    await baseContract.sign(privateKey);

    expect(baseContract.getSignature(0)).toBeDefined();
  });

  it('should get decoded signature from list of decoded signatures', async () => {
    const payload = new TestBaseContractPayload();
    baseContract.fromPayload(payload);
    await baseContract.sign(privateKey, { test: 'test' });

    expect(baseContract.getDecodedSignature(0)).toEqual({
      protectedHeader: {
        alg: 'RS256',
        test: 'test',
      },
      unprotectedHeader: {},
    });
  });

  it('should get payload from contract', () => {
    const payload = new TestBaseContractPayload();
    baseContract.fromPayload(payload);

    expect(baseContract.getPayload()).toEqual(payload);
  });

  it('should get data from contract', () => {
    const payload = new TestBaseContractPayload();
    baseContract.fromPayload(payload);

    expect(baseContract.data).toEqual({
      payload: Base64Utils.encodeAndRemovePadding(payload.toString()),
      signatures: [],
    });
  });

  describe('BaseContract sign', () => {
    it('should sign by FlattenedSign successfully', async () => {
      const payload = new TestBaseContractPayload();
      baseContract.fromPayload(payload);
      await baseContract.sign(privateKey);

      expect(baseContract.getSignature(0)).toBeDefined();
    });

    it('should throw error if total signatures exceed', async () => {
      const payload = new TestBaseContractPayload();
      baseContract.fromPayload(payload);
      await baseContract.sign(privateKey);
      await baseContract.sign(privateKey);

      await expect(baseContract.sign(privateKey)).rejects.toThrow();
    });
  });

  describe('BaseContract verifySingleSignature', () => {
    it('should verify single signature', async () => {
      const payload = new TestBaseContractPayload();
      baseContract.fromPayload(payload);
      await baseContract.sign(privateKey);

      await baseContract.verifySingleSignature(0, publicKey);

      expect(baseContract.errors.length).toEqual(0);
    });

    it('should verify single signature successfully with getPublicKeyFn', async () => {
      const payload = new TestBaseContractPayload();
      baseContract.fromPayload(payload);
      await baseContract.sign(privateKey, {}, { kid: 'test' });

      await baseContract.verifySingleSignature(0, _kid => Promise.resolve(publicKey));

      expect(baseContract.errors.length).toEqual(0);
    });

    it('should throw error if verify with getPublicKeyFn but no kid in header', async () => {
      const payload = new TestBaseContractPayload();
      baseContract.fromPayload(payload);
      await baseContract.sign(privateKey);

      await expect(
        baseContract.verifySingleSignature(0, _kid => Promise.resolve(publicKey)),
      ).rejects.toThrow();
    });

    it('should throw error if signature is invalid', async () => {
      const payload = new TestBaseContractPayload();
      baseContract.fromPayload(payload);
      await baseContract.sign(privateKey);

      await expect(baseContract.verifySingleSignature(0, publicKey2)).rejects.toThrow();
    });
  });

  describe('BaseContract verifySomeSignatures', () => {
    it('should verify some first signatures by order', async () => {
      const payload = new TestBaseContractPayload();
      baseContract.fromPayload(payload);
      await baseContract.sign(privateKey);
      await baseContract.sign(privateKey);

      await baseContract.verifySomeSignatures(2, [publicKey, publicKey]);

      expect(baseContract.errors.length).toEqual(0);
    });
  });

  describe('BaseContract verifyAllSignatures', () => {
    it('should verify all signatures', async () => {
      const payload = new TestBaseContractPayload();
      baseContract.fromPayload(payload);
      await baseContract.sign(privateKey);
      await baseContract.sign(privateKey);

      await baseContract.verifyAllSignatures([publicKey, publicKey]);

      expect(baseContract.errors.length).toEqual;
    });
  });

  describe('BaseContract transformAndValidate', () => {
    it('should transform and validate the contract from JWS successfully', async () => {
      const payload = new TestBaseContractPayload();
      payload.iss = uuidv4();
      payload.aud = uuidv4();
      payload.sub = uuidv4();
      payload.contractId = uuidv4();
      baseContract.fromPayload(payload);
      await baseContract.sign(privateKey);

      const newContract = new TestBaseContract().fromJWS(baseContract.data);

      await newContract.transformAndValidate(TestBaseContractPayload);

      expect(newContract.errors.length).toEqual(0);
    });

    // eslint-disable-next-line max-len
    it('transformAndValidate: should throw error if Payload not match DTO and pushsing error into contract.errors', async () => {
      const payload = new TestBaseContractPayload();
      payload.iss = uuidv4();
      payload.aud = uuidv4();
      payload.sub = uuidv4();
      baseContract.fromPayload(payload);
      await baseContract.sign(privateKey);

      const newContract = new TestBaseContract().fromJWS(baseContract.data);

      await expect(newContract.transformAndValidate(TestBaseContractPayload)).rejects.toThrow();
      expect(newContract.errors.length).toEqual(1);
    });
  });
});
