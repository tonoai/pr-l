import { v4 as uuidv4 } from 'uuid';
import { ContractPinetEventPayload, PinetEvent } from './pinet-event';
import { EVENT_CONSUMPTION_ACTIVITY_RESPONSE } from './const/event-types';

export class ConsumptionActivityResponseEventPayload extends ContractPinetEventPayload {}

// eslint-disable-next-line max-len
export class ConsumptionActivityResponsePinetEvent extends PinetEvent<ConsumptionActivityResponseEventPayload> {
  constructor(event?: Partial<ConsumptionActivityResponsePinetEvent>) {
    super(event);
    if (!this.header) {
      this.header = {
        eventId: uuidv4(),
        eventType: EVENT_CONSUMPTION_ACTIVITY_RESPONSE,
        eventVersion: '1.0.0',
      };
    }
  }
}
