import { Injectable } from '@nestjs/common';

export interface ErrorCodeInterface {
  errorCode: string;
  message: string;
}

@Injectable()
export class ErrorCodeService {
  static errorCodes: object = {};

  static register(errorCodes: { [key: string]: string }) {
    ErrorCodeService.errorCodes = { ...ErrorCodeService.errorCodes, ...errorCodes };
  }

  static getError(code: string): ErrorCodeInterface {
    const error = ErrorCodeService.errorCodes[code];

    return error ? { errorCode: code, message: error } : error;
  }

  register(errorCodes: { [key: string]: string }) {
    ErrorCodeService.register(errorCodes);
  }

  getError(code: string): ErrorCodeInterface {
    return ErrorCodeService.getError(code);
  }
}
