import type { DailyReconciliationContractPayload } from './daily-reconciliation.contract-payload';
import { BaseContract } from '@pressingly-modules/event-contract/src/contract/base.contract';

export class DailyReconciliationContract extends BaseContract<DailyReconciliationContractPayload> {
  public mySignatureIndex = 0;
  public pinetCoreSignatureIndex = 1;
  public partnerSignatureIndex = 2;
  public pinetCoreSignatureIndex2 = 3;
  totalSignatures = 4;
}
