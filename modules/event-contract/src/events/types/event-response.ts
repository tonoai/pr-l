import type { PinetContract } from '@pressingly-modules/event-contract/src/events/pinet-event';

export interface EventResponse {
  id: string;
  contract: PinetContract;
}
