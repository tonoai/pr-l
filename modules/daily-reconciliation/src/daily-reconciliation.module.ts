import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyReconciliationEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation.entity';
import { DailyReconciliationMismatchEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation-mismatch.entity';
import { DailyReconciliationResolutionEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation-resolution.entity';
import { ReconciliationBuilder } from '@pressingly-modules/daily-reconciliation/src/builders/reconciliation-data.builder';
import { DailyReconciliationSubscriptionChargesEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation-subscription-charges.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailyReconciliationEntity,
      DailyReconciliationMismatchEntity,
      DailyReconciliationResolutionEntity,
      DailyReconciliationSubscriptionChargesEntity,
    ]),
  ],
  providers: [ReconciliationBuilder],
  exports: [ReconciliationBuilder],
})
export class DailyReconciliationModule {}
