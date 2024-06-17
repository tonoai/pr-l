import { ValidationPipeOptions } from '@nestjs/common';

export const validationOptions: ValidationPipeOptions = {
  transform: true,
  forbidNonWhitelisted: false,
  skipMissingProperties: false,
  whitelist: true,
};
