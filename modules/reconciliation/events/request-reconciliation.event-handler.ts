import { PinetContract } from '@pressingly-modules/event-contract/src/events/pinet-event';
import { RequestReconciliationEvent } from '@pressingly-modules/reconciliation/events/request-reconciliation.event';
import { EventsHandler } from '@nestjs/cqrs';

@EventsHandler(RequestReconciliationEvent)
export class RequestReconciliationEventHandler {
  constructor(
    public readonly date: string,
    public readonly partnerId: string,
    public readonly contract: PinetContract,
  ) {}
}
