import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GeneralJWSSignature } from '../contracts/base.contract';

export class PinetEventHeader {
  @IsUUID('4')
  eventId!: string;

  @IsNotEmpty()
  @IsString()
  eventType!: string;

  @IsNotEmpty()
  @IsString()
  eventVersion: string = '1.0.0';
}

export class RawContract {
  @IsNotEmpty()
  @IsString()
  payload!: string;

  @ArrayNotEmpty()
  @IsArray()
  signatures!: GeneralJWSSignature[];
}

/**
 * For now, event payload is a contract
 * So, use ContractEventPayload as default event-payload
 * If it has another event-payload, not use contract concept
 * Create PinetEventPayload as Base, then ContractPinetEventPayload will extend PinetEventPayload
 * And create another event-payload, like: NotContractPinetEventPayload extend PinetEventPayload
 * BaseEvent will be: BaseEvent<T extends PinetEventPayload>
 */
export class ContractEventPayload {
  @IsNotEmptyObject()
  @ValidateNested()
  contract!: RawContract;
}

export class BaseEvent<T extends ContractEventPayload> {
  @IsNotEmptyObject()
  payload!: T;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => PinetEventHeader)
  header!: PinetEventHeader;

  constructor(event?: Partial<BaseEvent<T>>) {
    if (event) {
      this.payload = event.payload ?? this.payload;
      this.header = event.header ?? this.header;
    }
  }
}
