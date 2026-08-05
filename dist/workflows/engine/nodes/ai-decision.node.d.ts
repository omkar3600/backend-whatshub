import { INodeExecutor, INodeSchema, ExecutionContext, ExecutionResult } from '../interfaces/node-executor.interface';
import { LlmProviderFactory } from '../../../ai/providers/llm-provider.factory';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class AiDecisionExecutor implements INodeExecutor {
    private readonly prisma;
    private readonly llmFactory;
    type: string;
    schema: INodeSchema;
    constructor(prisma: PrismaService, llmFactory: LlmProviderFactory);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
