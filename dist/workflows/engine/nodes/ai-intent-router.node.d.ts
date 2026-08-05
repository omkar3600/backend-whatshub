import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
import { LlmProviderFactory } from '../../../ai/providers/llm-provider.factory';
import { PrismaService } from '../../../prisma/prisma.service';
declare class AiIntentRouterSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class AiIntentRouterExecutor implements INodeExecutor {
    private readonly prisma;
    private readonly llmFactory;
    type: string;
    schema: AiIntentRouterSchema;
    private readonly logger;
    constructor(prisma: PrismaService, llmFactory: LlmProviderFactory);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
