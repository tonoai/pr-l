import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';

enum LogLevel {
  verbose = 1,
  debug = 2,
  log = 3,
  warn = 4,
  error = 5,
  fatal = 6,
}

@Injectable()
export class Logger extends ConsoleLogger {
  private logLevel: number = 3;

  constructor(private configService: ConfigService) {
    super();

    const logLevel = configService.getOrThrow('app').logLevel;
    this.setLogLevel(logLevel);
    // can use with logLevels of ConsoleLogger
    // const logLevels = Object.keys(LogLevel).filter(key => LogLevel[key] < logLevel);
    // this.setLogLevels(logLevels);
  }

  setLogLevel(level: number) {
    this.logLevel = level ?? this.logLevel;
  }

  verbose(message: any, ...args: any[]) {
    if (this.logLevel > LogLevel.verbose) {
      return;
    }
    console.log(message, ...args);
    super.verbose(message, ...args);
    Sentry.captureMessage(message, {
      level: 'info',
      extra: args[0],
    });
  }

  debug(message: any, ...args: any[]) {
    if (this.logLevel > LogLevel.debug) {
      return;
    }

    console.debug(message, ...args);
    super.debug(message, ...args);
    Sentry.captureMessage(message, {
      level: 'debug',
      extra: args[0],
    });
  }

  log(message: any, ...args: any[]) {
    if (this.logLevel > LogLevel.log) {
      return;
    }

    console.log(message, ...args);
    super.log(message, ...args);
    Sentry.captureMessage(message, {
      level: 'log',
      extra: args[0],
    });
  }

  warn(message: any, ...args: any[]) {
    if (this.logLevel > LogLevel.warn) {
      return;
    }

    console.warn(message, ...args);
    super.warn(message, ...args);
    Sentry.captureMessage(message, {
      level: 'warning',
      extra: args[0],
    });
  }

  error(message: any, ...args: any[]) {
    if (this.logLevel > LogLevel.error) {
      return;
    }

    console.error(message, ...args);
    super.error(message, ...args);
    Sentry.captureException(message, {
      level: 'error',
      extra: args[0],
    });
  }

  fatal(message: any, ...args: any[]) {
    if (this.logLevel > LogLevel.fatal) {
      return;
    }

    console.error(message, ...args);
    super.fatal(message, ...args);
    Sentry.captureException(message, {
      level: 'fatal',
      extra: args[0],
    });
  }
}
