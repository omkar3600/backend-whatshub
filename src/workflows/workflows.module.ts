import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { WorkflowPublishingService } from './engine/workflow-publishing.service';
import { ExpressionEngineService } from './engine/expression-engine.service';
import { NodeExecutorRegistry } from './engine/registries/node-executor.registry';
import { TriggerRegistry } from './engine/registries/trigger.registry';
import { WorkflowQueueProcessor } from './engine/processors/workflow-queue.processor';
import { SendMessageExecutor } from './engine/nodes/send-message.node';
import { DelayExecutor } from './engine/nodes/delay.node';
import { ConditionExecutor } from './engine/nodes/condition.node';
import { WaitReplyExecutor } from './engine/nodes/wait-reply.node';
import { AiAgentExecutor } from './engine/nodes/ai-agent.node';
import { IncomingMessageTrigger } from './engine/triggers/incoming-message.trigger';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'workflow-execution-queue',
    }),
    BullModule.registerQueue({
      name: 'workflow-dlq',
    }),
    forwardRef(() => WhatsappModule),
    forwardRef(() => AiModule),
  ],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService,
    WorkflowEngineService,
    WorkflowPublishingService,
    ExpressionEngineService,
    NodeExecutorRegistry,
    TriggerRegistry,
    WorkflowQueueProcessor,
    SendMessageExecutor,
    DelayExecutor,
    ConditionExecutor,
    WaitReplyExecutor,
    AiAgentExecutor,
    IncomingMessageTrigger,
  ],
  exports: [WorkflowEngineService, TriggerRegistry]
})
export class WorkflowsModule implements OnModuleInit {
  constructor(
    private readonly nodeRegistry: NodeExecutorRegistry,
    private readonly sendMessageExecutor: SendMessageExecutor,
    private readonly delayExecutor: DelayExecutor,
    private readonly conditionExecutor: ConditionExecutor,
    private readonly waitReplyExecutor: WaitReplyExecutor,
    private readonly aiAgentExecutor: AiAgentExecutor,
    private readonly incomingMessageTrigger: IncomingMessageTrigger,
    private readonly triggerRegistry: TriggerRegistry,
  ) {}

  onModuleInit() {
    this.nodeRegistry.register(this.sendMessageExecutor);
    this.nodeRegistry.register(this.delayExecutor);
    this.nodeRegistry.register(this.conditionExecutor);
    this.nodeRegistry.register(this.waitReplyExecutor);
    this.nodeRegistry.register(this.aiAgentExecutor);

    this.triggerRegistry.register(this.incomingMessageTrigger);
  }
}
