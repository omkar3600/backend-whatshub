import { OnModuleInit } from '@nestjs/common';
import { NodeExecutorRegistry } from './engine/registries/node-executor.registry';
import { TriggerRegistry } from './engine/registries/trigger.registry';
import { SendMessageExecutor } from './engine/nodes/send-message.node';
import { DelayExecutor } from './engine/nodes/delay.node';
import { ConditionExecutor } from './engine/nodes/condition.node';
import { WaitReplyExecutor } from './engine/nodes/wait-reply.node';
import { IncomingMessageTrigger } from './engine/triggers/incoming-message.trigger';
export declare class WorkflowsModule implements OnModuleInit {
    private readonly nodeRegistry;
    private readonly sendMessageExecutor;
    private readonly delayExecutor;
    private readonly conditionExecutor;
    private readonly waitReplyExecutor;
    private readonly incomingMessageTrigger;
    private readonly triggerRegistry;
    constructor(nodeRegistry: NodeExecutorRegistry, sendMessageExecutor: SendMessageExecutor, delayExecutor: DelayExecutor, conditionExecutor: ConditionExecutor, waitReplyExecutor: WaitReplyExecutor, incomingMessageTrigger: IncomingMessageTrigger, triggerRegistry: TriggerRegistry);
    onModuleInit(): void;
}
