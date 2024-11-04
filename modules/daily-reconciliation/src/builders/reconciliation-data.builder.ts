import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractReconciliationBuilder } from '@pressingly-modules/daily-reconciliation-builder/src/builders/abstract-reconciliation.builder';
import { DailyReconciliationEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation.entity';
import { DailyReconciliationMismatchEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation-mismatch.entity';
import { DailyReconciliationResolutionEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation-resolution.entity';
import { Repository } from 'typeorm';
import { DailyReconciliationSubscriptionChargesEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation-subscription-charges.entity';

@Injectable()
export class ReconciliationBuilder extends AbstractReconciliationBuilder {
  constructor(
    @InjectRepository(DailyReconciliationEntity)
    private readonly reconciliationRepository: Repository<DailyReconciliationEntity>,
    @InjectRepository(DailyReconciliationMismatchEntity)
    private readonly mismatchRepository: Repository<DailyReconciliationMismatchEntity>,
    @InjectRepository(DailyReconciliationResolutionEntity)
    private readonly resolutionRepository: Repository<DailyReconciliationResolutionEntity>,
    @InjectRepository(DailyReconciliationSubscriptionChargesEntity)
    private readonly subscriptionChargeRepository: Repository<DailyReconciliationSubscriptionChargesEntity>,
  ) {
    super();
  }

  upsertReconciliation(
    input: Partial<DailyReconciliationEntity>,
  ): Promise<DailyReconciliationEntity> {
    return this.reconciliationRepository.save(input) as Promise<DailyReconciliationEntity>;
  }

  upsertReconciliationMismatches(
    input: Partial<DailyReconciliationMismatchEntity>[],
  ): Promise<DailyReconciliationMismatchEntity[]> {
    return this.mismatchRepository.save(input);
  }

  upsertReconciliationResolution(
    input: Partial<DailyReconciliationResolutionEntity>,
  ): Promise<DailyReconciliationResolutionEntity> {
    return this.resolutionRepository.save(input) as Promise<DailyReconciliationResolutionEntity>;
  }

  upsertReconciliationSubscriptionCharges(
    input: Partial<DailyReconciliationSubscriptionChargesEntity>[],
  ): Promise<DailyReconciliationSubscriptionChargesEntity[]> {
    return this.subscriptionChargeRepository.save(input) as Promise<
      DailyReconciliationSubscriptionChargesEntity[]
    >;
  }
}
