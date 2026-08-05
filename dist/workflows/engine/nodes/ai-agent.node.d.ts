import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from "../interfaces/node-executor.interface";
import { AgentOrchestratorService } from "../../../ai/orchestrator/agent-orchestrator.service";
import { WhatsappService } from "../../../whatsapp/whatsapp.service";
import { PrismaService } from "../../../prisma/prisma.service";
declare class AiAgentSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class AiAgentExecutor implements INodeExecutor {
    private readonly prisma;
    private readonly orchestrator;
    private readonly whatsappService;
    type: string;
    schema: AiAgentSchema;
    private readonly logger;
    constructor(prisma: PrismaService, orchestrator: AgentOrchestratorService, whatsappService: WhatsappService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
