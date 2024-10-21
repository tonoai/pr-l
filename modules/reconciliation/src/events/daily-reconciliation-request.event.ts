import { v4 as uuidv4 } from 'uuid';
import { BaseEvent, ContractEventPayload } from './base-event';

// Todo:should use base event from npm package
export class DailyReconciliationRequestEvent extends BaseEvent<ContractEventPayload> {
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
