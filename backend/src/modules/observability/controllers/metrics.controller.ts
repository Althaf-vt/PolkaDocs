import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Registry, collectDefaultMetrics } from 'prom-client';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('metrics')
export class MetricsController {
    private readonly registry: Registry;

    constructor() {
        this.registry = new Registry();
        this.registry.setDefaultLabels({ app: 'polkadocs-api' });
        collectDefaultMetrics({ register: this.registry });
    }

    @Public()
    @Get()
    async getMetrics(@Res() res: Response): Promise<void> {
        res.setHeader('Content-Type', this.registry.contentType);
        const metrics = await this.registry.metrics();
        res.send(metrics);
    }
}