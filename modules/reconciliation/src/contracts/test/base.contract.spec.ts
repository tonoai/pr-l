import { generateKeyPairSync } from 'crypto';
import { BaseContract } from '../base.contract';
import type { GeneralJWS } from 'jose';
import { BaseContractPayload } from '@modules/contracts/base.contracts-payload';
import { v4 as uuidv4 } from 'uuid';
import type { Key } from '@modules/revenue-key/interfaces/key.interface';

class TestBaseContractPayload extends BaseContractPayload {
  contractType = 'TestContract';
}

class TestBaseContract extends BaseContract<TestBaseContractPayload> {
  async verifyTestSignature(getPublicKeyFn: (kid) => Promise<Key>, signatureIndex = 0) {
    const publicKey = (await getPublicKeyFn('any')).publicKey;
    await this.verifySingleSignature(publicKey, signatureIndex);

    return this;
  }

  verifySignatures(getPublicKeyFn: (kid) => Promise<Key>): Promise<this> {
    return this.verifyTestSignature(getPublicKeyFn, 0);
  }
}

describe('BaseContract', () => {
  let baseContract: BaseContract<TestBaseContractPayload>;
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

  beforeEach(() => {
    baseContract = new TestBaseContract();
  });

  it('should initialize with payload', () => {
    const payload = new TestBaseContractPayload();
    const contract = new TestBaseContract(payload);
    expect(contract.getPayload()).toEqual(payload);
  });

  describe('BaseContract base64Encode', () => {
    it('should correctly encode string to base64', () => {
      const data = 'test';
      const encoded = TestBaseContract.base64Encode(data);

      expect(encoded).toEqual(Buffer.from(data).toString('base64').replace(/=+$/, ''));
    });

    it('should correctly encode Uint8Array to base64', () => {
      const data = new Uint8Array([116, 101, 115, 116]); // 'test' in Uint8Array
      const encoded = TestBaseContract.base64Encode(data);

      expect(encoded).toEqual(Buffer.from(data).toString('base64').replace(/=+$/, ''));
    });
  });

  it('should init contracts from payload successfully', () => {
    const payload = new TestBaseContractPayload();
    baseContract.fromPayload(payload);

    expect(baseContract.getPayload()).toEqual(payload);
    expect(baseContract.data).toEqual({
      payload: BaseContract.base64Encode(payload.toString()),
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

  it('should get payload from contracts', () => {
    const payload = new TestBaseContractPayload();
    baseContract.fromPayload(payload);

    expect(baseContract.getPayload()).toEqual(payload);
  });

  describe('BaseContract sign', () => {
    it('should sign by FlattenedSign successfully', () => {
      const payload = new TestBaseContractPayload();
      baseContract.fromPayload(payload);

      expect(() => baseContract.sign(privateKey)).not.toThrow();
    });
  });

  it('should sign and verify payload', async () => {
    const payload = new TestBaseContractPayload();
    baseContract.fromPayload(payload);

    // Sign the payload
    await baseContract.sign(privateKey);

    // Verify the payload
    const { protectedHeader: verifiedHeader } = await baseContract.verifyAnySignature(publicKey);

    // Check if the verified header matches the original protected header
    expect(verifiedHeader).toBeDefined();
  });

  it('should verify single signature', async () => {
    const payload = new TestBaseContractPayload();
    baseContract.fromPayload(payload);
    await baseContract.sign(privateKey);

    const { protectedHeader: verifiedHeader } = await baseContract.verifySingleSignature(
      publicKey,
      0,
    );

    expect(verifiedHeader).toBeDefined();
  });

  it('should get data from contracts', () => {
    const payload = new TestBaseContractPayload();
    baseContract.fromPayload(payload);

    expect(baseContract.data).toEqual({
      payload: BaseContract.base64Encode(payload.toString()),
      signatures: [],
    });
  });

  it('should transform and validate the contracts from JWS successfully', async () => {
    const payload = new TestBaseContractPayload();
    payload.iss = uuidv4();
    payload.aud = uuidv4();
    payload.sub = uuidv4();
    payload.contractId = uuidv4();
    baseContract.fromPayload(payload);
    await baseContract.sign(privateKey);

    const newContract = new TestBaseContract().fromJWS(baseContract.data);

    await newContract.transformAndValidate(TestBaseContractPayload, async kid =>
      Promise.resolve({
        kid,
        publicKey,
      }),
    );

    expect(newContract.error).toBeUndefined();
  });

  it('transformAndValidate: should has error if Payload not match DTO', async () => {
    const payload = new TestBaseContractPayload();
    baseContract.fromPayload(payload);
    await baseContract.sign(privateKey);

    const newContract = new TestBaseContract().fromJWS(baseContract.data);

    await newContract.transformAndValidate(TestBaseContractPayload, async kid =>
      Promise.resolve({
        kid,
        publicKey,
      }),
    );

    expect(newContract.error).toBeDefined();
  });

  it('transformAndValidate: should has error if signature not valid or not match with key', async () => {
    const payload = new TestBaseContractPayload();
    payload.iss = uuidv4();
    payload.aud = uuidv4();
    payload.sub = uuidv4();
    payload.contractId = uuidv4();
    baseContract.fromPayload(payload);
    await baseContract.sign(privateKey);

    const newContract = new TestBaseContract().fromJWS(baseContract.data);

    const { publicKey: publicKey2 } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    await newContract.transformAndValidate(TestBaseContractPayload, async kid =>
      Promise.resolve({
        kid,
        // wrong key here
        publicKey: publicKey2,
      }),
    );

    expect(newContract.error).toBeDefined();
  });
});
