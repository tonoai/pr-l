import { v4 as uuidv4 } from 'uuid';
import { ContractPinetEventPayload, PinetEvent } from './pinet-event';
import { EVENT_DISPUTE_RESPONSE } from './const/event-types';

export class DisputeRequestPinetEventPayload extends ContractPinetEventPayload {}

export class DisputeResponsePinetEvent extends PinetEvent<DisputeRequestPinetEventPayload> {
  constructor(event?: Partial<DisputeResponsePinetEvent>) {
    super(event);
    if (!this.header) {
      this.header = {
        eventId: uuidv4(),
        eventType: EVENT_DISPUTE_RESPONSE,
        eventVersion: '1.0.0',
      };
    }
  }
}
