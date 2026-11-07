import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { MetricsController } from './controllers/metrics.controller';

@Module({
  controllers: [HealthController, MetricsController],
})
export class ObservabilityModule {}