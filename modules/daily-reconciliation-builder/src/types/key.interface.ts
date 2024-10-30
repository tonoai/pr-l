import type { KeyObject } from 'crypto';

export interface PrivateKeyInterface {
  kid: string;
  privateKey: KeyObject;
}

export interface PublicKeyInterface {
  kid: string;
  publicKey: KeyObject;
}
