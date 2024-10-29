import { PinetContract } from '@pressingly-modules/event-contract/src/events/pinet-event';

export class RequestReconciliationEvent {
  constructor(
    public readonly date: string,
    public readonly partnerId: string,
    public readonly contract: PinetContract,
  ) {}
}
