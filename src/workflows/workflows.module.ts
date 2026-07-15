import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { ExpressionEngineService } from './engine/expression-engine.service';
import { NodeExecutorRegistry } from './engine/registries/node-executor.registry';
import { TriggerRegistry } from './engine/registries/trigger.registry';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'workflow-execution-queue',
    }),
    BullModule.registerQueue({
      name: 'workflow-dlq',
    }),
  ],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService,
    WorkflowEngineService,
    ExpressionEngineService,
    NodeExecutorRegistry,
    TriggerRegistry,
  ],
  exports: [WorkflowEngineService]
})
export class WorkflowsModule {}
