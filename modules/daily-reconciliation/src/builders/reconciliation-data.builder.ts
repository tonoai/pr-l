import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractReconciliationBuilder } from '@pressingly-modules/daily-reconciliation-builder/src/builders/abstract-reconciliation.builder';
import { DailyReconciliationEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation.entity';
import { DailyReconciliationMismatchEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation-mismatch.entity';
import { DailyReconciliationResolutionEntity } from '@pressingly-modules/daily-reconciliation/src/entities/daily-reconciliation-resolution.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReconciliationBuilder extends AbstractReconciliationBuilder {
  constructor(
    @InjectRepository(DailyReconciliationEntity)
    private readonly reconciliationRepository: Repository<DailyReconciliationEntity>,
    @InjectRepository(DailyReconciliationMismatchEntity)
    private readonly mismatchRepository: Repository<DailyReconciliationMismatchEntity>,
    @InjectRepository(DailyReconciliationResolutionEntity)
    private readonly resolutionRepository: Repository<DailyReconciliationResolutionEntity>,
  ) {
    super();
  }

  upsertReconciliation<T = DailyReconciliationEntity>(input: Partial<T>): Promise<T> {
    return this.reconciliationRepository.save(input) as Promise<T>;
  }

  upsertReconciliationMismatch<T = DailyReconciliationMismatchEntity>(
    input: Partial<T>,
  ): Promise<T> {
    return this.mismatchRepository.save(input) as Promise<T>;
  }

  upsertReconciliationResolution<T = DailyReconciliationMismatchEntity>(
    input: Partial<T>,
  ): Promise<T> {
    return this.resolutionRepository.save(input) as Promise<T>;
  }
}
