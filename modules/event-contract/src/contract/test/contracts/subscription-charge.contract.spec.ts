import { plainToInstance } from 'class-transformer';
// eslint-disable-next-line max-len
import { CreateSubscriptionChargeContractPayload } from '../../contracts/subscription-charge/create-subscription-charge.contract-payload';
// eslint-disable-next-line max-len
import { SubscriptionChargeContract } from '../../contracts/subscription-charge/subscription-charge.contract';

describe('SubscriptionChargeContract', () => {
  let contract: SubscriptionChargeContract<CreateSubscriptionChargeContractPayload>;

  beforeEach(async () => {
    const payload = plainToInstance(CreateSubscriptionChargeContractPayload, {
      contractDataRaw: {
        subscriptionChargeId: 'someChargeId',
      },
    });
    contract = new SubscriptionChargeContract(payload);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('SubscriptionChargeContract define all signatures', async () => {
    expect(contract).toBeDefined();
    expect(contract.totalSignatures).toEqual(4);
    expect(contract.membershipSignatureIndex).toBeDefined();
    expect(contract.firstPinetCoreSignatureIndex).toBeDefined();
    expect(contract.publisherSignatureIndex).toBeDefined();
    expect(contract.secondPinetCoreSignatureIndex).toBeDefined();
  });
});
