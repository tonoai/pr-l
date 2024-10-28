export class Base64Utils {
  static encode(value: string | Uint8Array): string {
    return Buffer.from(value).toString('base64');
  }

  static decode(value: string): string {
    return Buffer.from(value, 'base64').toString('utf-8');
  }

  static encodeAndRemovePadding(value: string | Uint8Array): string {
    return Base64Utils.encode(value).replace(/=+$/, '');
  }
}
