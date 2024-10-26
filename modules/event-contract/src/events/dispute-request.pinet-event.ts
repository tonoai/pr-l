import { v4 as uuidv4 } from 'uuid';
import { ContractPinetEventPayload, PinetEvent } from './pinet-event';
import { EVENT_DISPUTE_REQUEST } from './const/event-types';

export class DisputeRequestPinetEventPayload extends ContractPinetEventPayload {}

export class DisputeRequestPinetEvent extends PinetEvent<DisputeRequestPinetEventPayload> {
  constructor(event?: Partial<DisputeRequestPinetEvent>) {
    super(event);
    if (!this.header) {
      this.header = {
        eventId: uuidv4(),
        eventType: EVENT_DISPUTE_REQUEST,
        eventVersion: '1.0.0',
      };
    }
  }
}
