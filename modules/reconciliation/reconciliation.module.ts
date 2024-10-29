import { DynamicModule, Module } from '@nestjs/common';
import { ReconciliationController } from '@pressingly-modules/reconciliation/reconciliation.controller';
import {
  ReconciliationConfigService,
  ReconciliationServiceConfigs,
} from '@pressingly-modules/reconciliation/services/reconciliation-config.service';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule],
  controllers: [ReconciliationController],
})
export class ReconciliationModule {
  static register(reconciliationServiceConfigs: ReconciliationServiceConfigs): DynamicModule {
    return {
      module: ReconciliationModule,
      providers: [
        {
          provide: ReconciliationConfigService,
          useFactory: () => new ReconciliationConfigService(reconciliationServiceConfigs),
        },
      ],
    };
  }
}
