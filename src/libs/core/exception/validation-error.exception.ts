import { HttpException } from '@nestjs/common';

export class ValidationErrorException extends HttpException {
  constructor(
    error: { [key: string]: any },
    errorCode?: string,
    message = 'Bad Request Exception',
  ) {
    super({ statusCode: 400, error, errorCode, isCustomError: true, message }, 400);
  }
}
