import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { HealthzController } from '../src/healthz.controller';

describe('PublisherPortalController', () => {
  let healthzController: HealthzController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthzController],
      providers: [],
    }).compile();

    healthzController = app.get<HealthzController>(HealthzController);
  });

  describe('root', () => {
    it('should return "OK"', () => {
      expect(healthzController.check()).toBe('OK');
    });
  });
});
