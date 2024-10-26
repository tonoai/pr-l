import { PinetEvent } from './pinet-event';
import type { SubscriptionChargePinetEventPayload } from './subscription-charge-request.pinet-event';
import { v4 as uuidv4 } from 'uuid';
import { EVENT_SUBSCRIPTION_CHARGE_RESPONSE } from '../contract/const/event-types';

// eslint-disable-next-line max-len
export class SubscriptionChargeResponsePinetEvent extends PinetEvent<SubscriptionChargePinetEventPayload> {
  constructor(event?: Partial<SubscriptionChargeResponsePinetEvent>) {
    super(event);
    if (!this.header) {
      this.header = {
        eventId: uuidv4(),
        eventType: EVENT_SUBSCRIPTION_CHARGE_RESPONSE,
        eventVersion: '1.0.0',
      };
    }
  }
}
