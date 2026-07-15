import { OnModuleInit } from '@nestjs/common';
import { NodeExecutorRegistry } from './engine/registries/node-executor.registry';
import { SendMessageExecutor } from './engine/nodes/send-message.node';
import { DelayExecutor } from './engine/nodes/delay.node';
export declare class WorkflowsModule implements OnModuleInit {
    private readonly nodeRegistry;
    private readonly sendMessageExecutor;
    private readonly delayExecutor;
    constructor(nodeRegistry: NodeExecutorRegistry, sendMessageExecutor: SendMessageExecutor, delayExecutor: DelayExecutor);
    onModuleInit(): void;
}
