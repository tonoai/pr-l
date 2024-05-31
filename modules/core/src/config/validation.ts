import { ValidationPipeOptions } from '@nestjs/common';

export const validationOptions: ValidationPipeOptions = {
  transform: true,
  forbidNonWhitelisted: false,
  skipMissingProperties: true,
  whitelist: true,
};
