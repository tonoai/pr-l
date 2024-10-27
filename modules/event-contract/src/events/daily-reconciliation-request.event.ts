import { v4 as uuidv4 } from 'uuid';
import {
  ContractPinetEventPayload,
  PinetEvent,
} from '@pressingly-modules/event-contract/src/events/pinet-event';

export class DailyReconciliationRequestEvent extends PinetEvent<ContractPinetEventPayload> {
  constructor(event?: Partial<DailyReconciliationRequestEvent>) {
    super(event);
    if (!this.header) {
      this.header = {
        eventId: uuidv4(),
        eventType: 'DailyReconciliationRequest',
        eventVersion: '1.0.0',
      };
    }
  }
}
