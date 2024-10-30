import { Injectable } from '@nestjs/common';
import type { Nullable } from '../types/common.type';

export interface ErrorCodeInterface {
  errorCode: string;
  message: string;
}

@Injectable()
export class ErrorCodeService {
  static errorCodes = new Map();
  static errorMessages = new Map();

  static register(errorCodes: { [key: string]: string }) {
    Object.entries(errorCodes).forEach(([key, value]) => {
      if (ErrorCodeService.errorCodes.has(key)) {
        throw new Error(`Error code ${key} already exists`);
      }
      if (ErrorCodeService.errorMessages.has(value)) {
        throw new Error(`Error message ${value} already exists`);
      }
      ErrorCodeService.errorCodes.set(key, value);
      ErrorCodeService.errorMessages.set(value, key);
    });
  }

  static getError(key: string): Nullable<ErrorCodeInterface> {
    // get error code by message
    const errorCode = ErrorCodeService.errorMessages.get(key);
    if (errorCode) {
      return { errorCode: errorCode, message: ErrorCodeService.errorCodes.get(errorCode) };
    }
    // get error message by code
    const errorMessage = ErrorCodeService.errorCodes.get(key);

    return errorMessage ? { errorCode: key, message: errorMessage } : null;
  }

  register(errorCodes: { [key: string]: string }) {
    ErrorCodeService.register(errorCodes);
  }

  getError(code: string): Nullable<ErrorCodeInterface> {
    return ErrorCodeService.getError(code);
  }
}
