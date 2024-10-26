import { BaseContract } from '../../base.contract';
import { DisputeRequestContractPayload } from './dispute-request.contract-payload';

export class DisputeRequestContract extends BaseContract<DisputeRequestContractPayload> {
  public membershipSignatureIndex = 0;
  public pinetCoreSignatureIndex = 1;
  public publisherSignatureIndex = 2;
  public secondPinetCoreSignatureIndex = 3;
  public secondPublisherSignatureIndex = 4;
  public thirdPinetCoreSignatureIndex = 5;
  public totalSignatures = 6;
}
