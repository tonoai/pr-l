import { v4 as uuidv4 } from 'uuid';
import { ContractPinetEventPayload, PinetEvent } from './pinet-event';
import { EVENT_CONSUMPTION_ACTIVITY_REQUEST } from './const/event-types';

export class ConsumptionActivityRequestEventPayload extends ContractPinetEventPayload {}

// eslint-disable-next-line max-len
export class ConsumptionActivityRequestPinetEvent extends PinetEvent<ConsumptionActivityRequestEventPayload> {
  constructor(event?: Partial<ConsumptionActivityRequestPinetEvent>) {
    super(event);
    if (!this.header) {
      this.header = {
        eventId: uuidv4(),
        eventType: EVENT_CONSUMPTION_ACTIVITY_REQUEST,
        eventVersion: '1.0.0',
      };
    }
  }
}
