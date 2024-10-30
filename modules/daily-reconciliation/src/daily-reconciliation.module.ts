import { DynamicModule, Module } from '@nestjs/common';
import { DailyReconciliationController } from '@pressingly-modules/daily-reconciliation/src/daily-reconciliation.controller';
import {
  ReconciliationConfigService,
  ReconciliationServiceConfigs,
} from '@pressingly-modules/daily-reconciliation/src/services/reconciliation-config.service';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule],
  controllers: [DailyReconciliationController],
})
export class DailyReconciliationModule {
  static register(reconciliationServiceConfigs: ReconciliationServiceConfigs): DynamicModule {
    return {
      module: DailyReconciliationModule,
      providers: [
        {
          provide: ReconciliationConfigService,
          useFactory: () => new ReconciliationConfigService(reconciliationServiceConfigs),
        },
      ],
    };
  }
}
