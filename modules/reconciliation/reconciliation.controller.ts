import { Body, Controller, Post } from '@nestjs/common';
import { TriggerReconciliationDto } from '@pressingly-modules/reconciliation/dtos/trigger-reconciliation.dto';
import { RequestReconciliationService } from '@pressingly-modules/reconciliation-builder/src/request-reconciliation.service';
import { ReconciliationServiceConfigs } from '@pressingly-modules/reconciliation/services/reconciliation-config.service';

@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationServiceConfigs: ReconciliationServiceConfigs) {}
  @Post()
  reconcile(@Body() body: TriggerReconciliationDto) {
    const requestReconciliationService = new RequestReconciliationService({
      dataBuilder: this.reconciliationServiceConfigs.dataBuilder,
      requestBuilder: this.reconciliationServiceConfigs.requestBuilder,
      myKey: this.reconciliationServiceConfigs.myKey,
      partnerKey: this.reconciliationServiceConfigs.partnerKey,
      partnerId: this.reconciliationServiceConfigs.partnerId,
      myId: this.reconciliationServiceConfigs.myId,
      date: new Date(body.date),
      maxRetry: this.reconciliationServiceConfigs.maxRetry,
      numberOfRetried: this.reconciliationServiceConfigs.numberOfRetried,
    });

    return requestReconciliationService.execute();
  }
}
