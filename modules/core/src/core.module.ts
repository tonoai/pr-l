import { BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { CoreService } from './core.service';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { AllExceptionsFilter } from './filter/all-exception.filter';
import { validationOptions } from './config/validation';

@Module({
  imports: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new ValidationPipe({
          ...validationOptions,
          exceptionFactory: errors => {
            return new BadRequestException(errors);
          },
        });
      },
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    CoreService,
  ],
  exports: [CoreService],
})
export class CoreModule {}
