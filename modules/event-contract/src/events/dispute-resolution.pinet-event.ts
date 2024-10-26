import { v4 as uuidv4 } from 'uuid';
import { ContractPinetEventPayload, PinetEvent } from './pinet-event';
import { EVENT_DISPUTE_RESOLUTION } from '../contract/const/event-types';

export class DisputeResolutionPinetEventPayload extends ContractPinetEventPayload {}

export class DisputeResolutionPinetEvent extends PinetEvent<DisputeResolutionPinetEventPayload> {
  constructor(event?: Partial<DisputeResolutionPinetEvent>) {
    super(event);
    if (!this.header) {
      this.header = {
        eventId: uuidv4(),
        eventType: EVENT_DISPUTE_RESOLUTION,
        eventVersion: '1.0.0',
      };
    }
  }
}
