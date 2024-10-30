import type { ArgumentsHost } from '@nestjs/common';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { ValidationError } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { ErrorCodeService } from '../exception/error-code.service';
import { IncomingMessage } from 'http';
import { EntityNotFoundError } from 'typeorm';
import { Logger } from '../logger/logger';

export interface FormattedResponse {
  statusCode: any;
  error: any;
  errorCode?: string;
  message?: any;
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(
    private readonly config: ConfigService,
    private logger: Logger,
  ) {
    super();
  }

  private static formatValidationsMessages(
    errors: ValidationError[] | ValidationError,
    messagesFormatted: object = {},
  ) {
    if (Array.isArray(errors)) {
      errors.map(error => {
        AllExceptionsFilter.formatValidationsMessages(error, messagesFormatted);
      });
    } else {
      if (errors.constraints) {
        messagesFormatted[errors.property] = errors.constraints;
      }
      if (errors.children) {
        messagesFormatted[errors.property] = messagesFormatted[errors.property] ?? {};
        AllExceptionsFilter.formatValidationsMessages(
          errors.children,
          messagesFormatted[errors.property],
        );
      }
    }

    return messagesFormatted;
  }

  private static format(exception: HttpException) {
    const errors = exception.getResponse();
    if (errors['errorCode']) {
      // full error
      return errors;
    } else if (typeof errors['message'] === 'string') {
      // only errorCode
      return ErrorCodeService.getError(errors['message']) ?? errors['message'];
    } else if (typeof errors === 'object' && errors['statusCode'] && errors['message']) {
      // these errors come from validation
      return AllExceptionsFilter.formatValidationsMessages(errors['message']);
    } else {
      return errors;
    }
  }

  catch(exception: any, host: ArgumentsHost) {
    const isDebug = this.config.get('app.debug');
    const response = host.switchToHttp().getResponse();

    let formattedResponse: FormattedResponse;
    if (exception instanceof HttpException) {
      const formatErrors = AllExceptionsFilter.format(exception);
      formattedResponse = {
        statusCode: exception.getStatus(),
        error: formatErrors['errorCode'] ? formatErrors['message'] : formatErrors,
        errorCode: formatErrors['errorCode'] ?? HttpStatus[exception.getStatus()],
      };

      this.logHandledError(exception, host);
    } else if (exception instanceof EntityNotFoundError) {
      formattedResponse = {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
      };
      this.logHandledError(exception, host);
    } else {
      this.logUnknownError(exception, host);
      formattedResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: exception.toString(),
      };
    }
    response.status(formattedResponse.statusCode).send({
      ...formattedResponse,
      stack: isDebug ? exception['stack'] : undefined,
      handler: isDebug ? 'AllExceptionsFilter' : undefined,
    });
  }

  logUnknownError(exception, host) {
    const request = host.switchToHttp().getRequest();
    const errorMessage = exception instanceof Error ? exception.message : '';
    const method = request instanceof IncomingMessage ? request.method : '';

    this.logger.error(
      exception,
      {
        name: 'REQUEST_ERROR',
        user: request.user,
      },
      `[${method}] [${request.url}] ${errorMessage}`,
    );
  }

  logHandledError(exception, host) {
    // only 2 types of handled errors for now: HttpException and EntityNotFoundError
    const request = host.switchToHttp().getRequest();
    const method = request instanceof IncomingMessage ? request.method : '';

    this.logger.warn(
      exception,
      `[${exception.getStatus ? exception.getStatus() : exception.name}] ${method}  ${request.url}`,
    );
  }
}
