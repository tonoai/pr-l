import type { ContractPinetEventPayload } from '@pressingly-modules/event-contract/src/events/pinet-event';
import { PinetEvent } from '@pressingly-modules/event-contract/src/events/pinet-event';
import { v4 as uuidv4 } from 'uuid';
import { EVENT_DAILY_RECONCILIATION_RESPONSE } from '@pressingly-modules/event-contract/src/events/const/event-types';

export class DailyReconciliationResponsePinetEvent extends PinetEvent<ContractPinetEventPayload> {
  constructor(event?: Partial<DailyReconciliationResponsePinetEvent>) {
    super(event);
    if (!this.header) {
      this.header = {
        eventId: uuidv4(),
        eventType: EVENT_DAILY_RECONCILIATION_RESPONSE,
        eventVersion: '1.0.0',
      };
    }
  }
}
