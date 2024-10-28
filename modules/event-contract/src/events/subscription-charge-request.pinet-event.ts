import { v4 as uuidv4 } from 'uuid';
import { ContractPinetEventPayload, PinetEvent } from './pinet-event';
import { EVENT_SUBSCRIPTION_CHARGE_REQUEST } from './const/event-types';

export class SubscriptionChargePinetEventPayload extends ContractPinetEventPayload {}

// eslint-disable-next-line max-len
export class SubscriptionChargeRequestPinetEvent extends PinetEvent<SubscriptionChargePinetEventPayload> {
  constructor(event?: Partial<SubscriptionChargeRequestPinetEvent>) {
    super(event);
    if (!this.header) {
      this.header = {
        eventId: uuidv4(),
        eventType: EVENT_SUBSCRIPTION_CHARGE_REQUEST,
        eventVersion: '1.0.0',
      };
    }
  }
}
