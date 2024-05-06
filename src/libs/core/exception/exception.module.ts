import { Global, Module } from '@nestjs/common';
import { ErrorCodeService } from './error-code.service';
import { commonErrorCodes } from './common-error-code';

@Global()
@Module({
  providers: [ErrorCodeService],
  exports: [ErrorCodeService],
})
export class ExceptionModule {
  constructor() {
    ErrorCodeService.register(commonErrorCodes);
  }
}
