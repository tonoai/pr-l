import { plainToInstance } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { DisputeRequestContract } from '../../contracts/dispute/dispute-request.contract';
import { DisputeRequestContractPayload } from '../../contracts/dispute/dispute-request.contract-payload';

describe('DisputeRequestContract', () => {
  let contract: DisputeRequestContract;

  beforeEach(async () => {
    const payload = plainToInstance(DisputeRequestContractPayload, {
      contractDataRaw: {
        subscriptionChargeId: uuidv4(),
        subscriptionChargeIncrementId: uuidv4(),
        membershipUserId: uuidv4(),
        reason: 'Test reason',
      },
    });
    contract = new DisputeRequestContract(payload);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('DisputeRequestContract define all signatures', async () => {
    expect(contract).toBeDefined();
    expect(contract.totalSignatures).toEqual(6);
    expect(contract.membershipSignatureIndex).toBeDefined();
    expect(contract.pinetCoreSignatureIndex).toBeDefined();
    expect(contract.publisherSignatureIndex).toBeDefined();
    expect(contract.secondPinetCoreSignatureIndex).toBeDefined();
    expect(contract.secondPublisherSignatureIndex).toBeDefined();
    expect(contract.thirdPinetCoreSignatureIndex).toBeDefined();
  });
});
