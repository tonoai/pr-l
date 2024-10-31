import { v4 as uuidv4 } from 'uuid';
import type { ContractPinetEventPayload } from '@pressingly-modules/event-contract/src/events/pinet-event';
import { PinetEvent } from '@pressingly-modules/event-contract/src/events/pinet-event';
import { EVENT_DAILY_RECONCILIATION_REQUEST } from '@pressingly-modules/event-contract/src/events/const/event-types';

export class DailyReconciliationRequestPinetEvent extends PinetEvent<ContractPinetEventPayload> {
  constructor(event?: Partial<DailyReconciliationRequestPinetEvent>) {
    super(event);
    if (!this.header) {
      this.header = {
        eventId: uuidv4(),
        eventType: EVENT_DAILY_RECONCILIATION_REQUEST,
        eventVersion: '1.0.0',
      };
    }
  }
}
