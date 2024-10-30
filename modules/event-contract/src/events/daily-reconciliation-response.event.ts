import type { ContractPinetEventPayload } from '@pressingly-modules/event-contract/src/events/pinet-event';
import { PinetEvent } from '@pressingly-modules/event-contract/src/events/pinet-event';
import { v4 as uuidv4 } from 'uuid';

export class DailyReconciliationResponseEvent extends PinetEvent<ContractPinetEventPayload> {
  constructor(event?: Partial<DailyReconciliationResponseEvent>) {
    super(event);
    if (!this.header) {
      this.header = {
        eventId: uuidv4(),
        eventType: 'DailyReconciliationResponse',
        eventVersion: '1.0.0',
      };
    }
  }
}
