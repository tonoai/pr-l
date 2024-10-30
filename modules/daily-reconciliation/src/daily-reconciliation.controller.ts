import { Body, Controller, Post } from '@nestjs/common';
import { TriggerReconciliationDto } from '@pressingly-modules/daily-reconciliation/src/dtos/trigger-reconciliation.dto';
import { RequestReconciliationService } from '@pressingly-modules/daily-reconciliation-builder/src/request-reconciliation.service';
import { ReconciliationServiceConfigs } from '@pressingly-modules/daily-reconciliation/src/services/reconciliation-config.service';

@Controller('daily-reconciliations')
export class DailyReconciliationController {
  constructor(private readonly reconciliationServiceConfigs: ReconciliationServiceConfigs) {}
  @Post()
  async reconcile(@Body() body: TriggerReconciliationDto) {
    const requestReconciliationService = await RequestReconciliationService.create({
      dataBuilder: this.reconciliationServiceConfigs.dataBuilder,
      requestBuilder: this.reconciliationServiceConfigs.requestBuilder,
      key: this.reconciliationServiceConfigs.key,
      partnerId: this.reconciliationServiceConfigs.partnerId,
      id: this.reconciliationServiceConfigs.id,
      date: new Date(body.date),
    });

    return requestReconciliationService.execute();
  }
}
