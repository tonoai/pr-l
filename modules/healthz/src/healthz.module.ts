import { Module } from '@nestjs/common';
import { HealthzController } from './healthz.controller';

@Module({
  imports: [],
  controllers: [HealthzController],
})
export class HealthzModule {}
