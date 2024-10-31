import type { JWSHeaderParameters } from 'jose';
import { CompactEncrypt } from 'jose';
import type { KeyObject } from 'crypto';
import { BaseContract } from '../base.contract';
import type { ConsumptionActivityRequestContractPayload } from './consumption-activity-request.contract-payload';

// eslint-disable-next-line max-len
export class ConsumptionActivityRequestContract extends BaseContract<ConsumptionActivityRequestContractPayload> {
  public membershipSignatureIndex = 0;
  public pinetCoreSignatureIndex = 1;
  public publisherSignatureIndex = 2;
  public secondPinetCoreSignatureIndex = 3;
  public totalSignatures = 4;

  async encryptProtectedHeader(
    protectedHeader: JWSHeaderParameters = {},
    key: KeyObject,
  ): Promise<JWSHeaderParameters> {
    if (protectedHeader['contractData']) {
      const plaintext = new TextEncoder().encode(JSON.stringify(protectedHeader['contractData']));
      protectedHeader['contractData'] = await new CompactEncrypt(plaintext)
        .setProtectedHeader({
          alg: 'RSA-OAEP-256',
          enc: 'A256GCM',
        })
        .encrypt(key);
    }

    return protectedHeader;
  }
}
