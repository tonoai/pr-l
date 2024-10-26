import { plainToInstance } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { generateKeyPairSync } from 'crypto';
import type { JWSHeaderParameters } from 'jose';
import { ConsumptionActivityRequestContract } from '../../contracts/dispute/consumtion-activity-request.contract';
import { ConsumptionActivityRequestContractPayload } from '../../contracts/dispute/consumption-activity-request.contract-payload';

describe('ConsumptionActivityRequestContract', () => {
  let contract: ConsumptionActivityRequestContract;

  const { publicKey: membershipPublicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  beforeEach(async () => {
    const payload = plainToInstance(ConsumptionActivityRequestContractPayload, {
      contractDataRaw: {
        subscriptionChargeId: uuidv4(),
      },
    });
    contract = new ConsumptionActivityRequestContract(payload);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('ConsumptionActivityRequestContract define all signatures', async () => {
    expect(contract).toBeDefined();
    expect(contract.totalSignatures).toEqual(4);
    expect(contract.membershipSignatureIndex).toBeDefined();
    expect(contract.pinetCoreSignatureIndex).toBeDefined();
    expect(contract.publisherSignatureIndex).toBeDefined();
    expect(contract.secondPinetCoreSignatureIndex).toBeDefined();
  });

  it('ConsumptionActivityRequestContract encryptProtectedHeader', async () => {
    let protectedHeader: JWSHeaderParameters = {
      contractData: {
        test: 'test',
      },
    };
    protectedHeader = await contract.encryptProtectedHeader(protectedHeader, membershipPublicKey);

    expect(typeof protectedHeader.contractData).toEqual('string');
  });
});
