import type { KeyObject } from 'crypto';

export interface KeyInterface {
  kid: string;
  publicKey: KeyObject;
  privateKey?: KeyObject;
}

export type GetPublicKeyFn = KeyObject | ((kid: string) => Promise<KeyInterface>);
