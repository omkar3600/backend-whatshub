import { Module } from '@nestjs/common';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';
import { FlowEngineService } from './flow-engine.service';

@Module({
  controllers: [FlowsController],
  providers: [FlowsService, FlowEngineService],
  exports: [FlowEngineService]
})
export class FlowsModule {}
