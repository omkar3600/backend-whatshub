import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { ExpressionEngineService } from './engine/expression-engine.service';
import { NodeExecutorRegistry } from './engine/registries/node-executor.registry';
import { TriggerRegistry } from './engine/registries/trigger.registry';
import { WorkflowQueueProcessor } from './engine/processors/workflow-queue.processor';
import { SendMessageExecutor } from './engine/nodes/send-message.node';
import { DelayExecutor } from './engine/nodes/delay.node';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'workflow-execution-queue',
    }),
    BullModule.registerQueue({
      name: 'workflow-dlq',
    }),
    WhatsappModule,
  ],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService,
    WorkflowEngineService,
    ExpressionEngineService,
    NodeExecutorRegistry,
    TriggerRegistry,
    WorkflowQueueProcessor,
    SendMessageExecutor,
    DelayExecutor,
  ],
  exports: [WorkflowEngineService]
})
export class WorkflowsModule implements OnModuleInit {
  constructor(
    private readonly nodeRegistry: NodeExecutorRegistry,
    private readonly sendMessageExecutor: SendMessageExecutor,
    private readonly delayExecutor: DelayExecutor,
  ) {}

  onModuleInit() {
    this.nodeRegistry.register(this.sendMessageExecutor);
    this.nodeRegistry.register(this.delayExecutor);
  }
}
