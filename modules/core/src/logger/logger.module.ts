import { Global, Module } from '@nestjs/common';
import { Logger } from './logger';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

@Global()
@Module({
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {
  constructor(private configService: ConfigService) {
    const sentryConfig = this.configService.getOrThrow('app.sentry');

    if (sentryConfig && sentryConfig.enable && sentryConfig.dsn) {
      Sentry.init({
        environment: sentryConfig.env,
        dsn: sentryConfig.dsn,
        integrations: [nodeProfilingIntegration()],
        // Tracing
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
      });
    }
  }
}
