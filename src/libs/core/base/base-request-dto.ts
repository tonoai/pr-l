import { TransformFnParams } from 'class-transformer/types/interfaces';

export class BaseRequestDto {
  static parseMultiQueryParams({ value }: TransformFnParams) {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(v => v.trim())
        .filter(v => v);
    }

    return value && Array.isArray(value) ? value.map(v => v.trim()) : [value.trim()];
  }
}
