import { Base64Utils } from './base-64.utils';

describe('Base64Utils', () => {
  describe('encode', () => {
    it('encodes a string to base64 format', () => {
      const result = Base64Utils.encode('hello world');
      expect(result).toBe('aGVsbG8gd29ybGQ=');
    });

    it('encodes a Uint8Array to base64 format', () => {
      const array = new Uint8Array([104, 101, 108, 108, 111]);
      const result = Base64Utils.encode(array);
      expect(result).toBe('aGVsbG8=');
    });
  });

  describe('decode', () => {
    it('decodes a base64 string to utf-8 format', () => {
      const result = Base64Utils.decode('aGVsbG8gd29ybGQ=');
      expect(result).toBe('hello world');
    });

    it('decodes a base64 string with non-ASCII characters', () => {
      const encoded = Buffer.from('hello world').toString('base64');
      const result = Base64Utils.decode(encoded);
      expect(result).toBe('hello world');
    });
  });

  describe('encodeAndRemovePadding', () => {
    it('encodes a string to base64 format then remove padding at the end', () => {
      const result = Base64Utils.encodeAndRemovePadding('hello world');
      expect(result).toBe('aGVsbG8gd29ybGQ');
    });

    it('encodes a Uint8Array to base64 format', () => {
      const array = new Uint8Array([104, 101, 108, 108, 111]);
      const result = Base64Utils.encodeAndRemovePadding(array);
      expect(result).toBe('aGVsbG8');
    });
  });
});
