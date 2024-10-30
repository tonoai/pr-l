import { Injectable } from '@nestjs/common';
import type { DataBuilderInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/data-builder.interface';
import type { RequestBuilderInterface } from '@pressingly-modules/daily-reconciliation-builder/src/types/request-builder-interface';
import type {
  PrivateKeyInterface,
  PublicKeyInterface,
} from '@pressingly-modules/daily-reconciliation-builder/src/types/key.interface';
import type { RequestReconciliationServiceConfigs } from '@pressingly-modules/daily-reconciliation-builder/src/request-reconciliation.service';
import type { ResolveReconciliationServiceConfigs } from '@pressingly-modules/daily-reconciliation-builder/src/resolve-reconciliation.service';

export interface ReconciliationServiceConfigs
  extends Omit<
    RequestReconciliationServiceConfigs & ResolveReconciliationServiceConfigs,
    'requestContract' | 'date'
  > {}

@Injectable()
export class ReconciliationConfigService implements ReconciliationServiceConfigs {
  dataBuilder: DataBuilderInterface;
  requestBuilder: RequestBuilderInterface;
  key: PrivateKeyInterface;
  // Todo: should load partner key and partnerId dynamically
  partnerKey: PublicKeyInterface;
  partnerId: string;
  id: string;
  date?: Date;
  maxRetry?: number;
  numberOfRetried?: number;

  constructor(configs: ReconciliationConfigService) {
    this.dataBuilder = configs.dataBuilder;
    this.requestBuilder = configs.requestBuilder;
    this.key = configs.key;
    this.partnerKey = configs.partnerKey;
    this.partnerId = configs.partnerId;
    this.id = configs.id;
    this.maxRetry = configs.maxRetry;
    this.numberOfRetried = configs.numberOfRetried;
  }
}
