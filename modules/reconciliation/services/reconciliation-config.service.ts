import { Injectable } from '@nestjs/common';
import { DataBuilderInterface } from '@pressingly-modules/reconciliation-builder/src/types/data-builder.interface';
import { RequestBuilderInterface } from '@pressingly-modules/reconciliation-builder/src/types/request-builder-interface';
import {
  PrivateKeyInterface,
  PublicKeyInterface,
} from '@pressingly-modules/reconciliation-builder/src/types/key.interface';
import { RequestReconciliationServiceConfigs } from '@pressingly-modules/reconciliation-builder/src/request-reconciliation.service';
import { ResolveReconciliationServiceConfigs } from '@pressingly-modules/reconciliation-builder/src/resolve-reconciliation.service';

export interface ReconciliationServiceConfigs
  extends Omit<
    RequestReconciliationServiceConfigs & ResolveReconciliationServiceConfigs,
    'requestContract' | 'date'
  > {}

@Injectable()
export class ReconciliationConfigService implements ReconciliationServiceConfigs {
  dataBuilder: DataBuilderInterface;
  requestBuilder: RequestBuilderInterface;
  myKey: PrivateKeyInterface;
  // Todo: should load partner key and partnerId dynamically
  partnerKey: PublicKeyInterface;
  partnerId: string;
  myId: string;
  date?: Date;
  maxRetry?: number;
  numberOfRetried?: number;

  constructor(configs: ReconciliationConfigService) {
    this.dataBuilder = configs.dataBuilder;
    this.requestBuilder = configs.requestBuilder;
    this.myKey = configs.myKey;
    this.partnerKey = configs.partnerKey;
    this.partnerId = configs.partnerId;
    this.myId = configs.myId;
    this.maxRetry = configs.maxRetry;
    this.numberOfRetried = configs.numberOfRetried;
  }
}
