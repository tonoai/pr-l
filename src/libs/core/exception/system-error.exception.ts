import { HttpException } from '@nestjs/common';

export class SystemErrorException extends HttpException {
  constructor(
    error: { [key: string]: any },
    errorCode?: string,
    message = 'System error Exception',
  ) {
    super({ statusCode: 400, error, errorCode, isCustomError: true, message }, 500);
  }
}
