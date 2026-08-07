import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from "../interfaces/node-executor.interface";
import { BusinessAgentService } from "../../../ai/business/business-agent.service";
import { WhatsappService } from "../../../whatsapp/whatsapp.service";
import { PrismaService } from "../../../prisma/prisma.service";
declare class AiAgentSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class AiAgentExecutor implements INodeExecutor {
    private readonly prisma;
    private readonly businessAgent;
    private readonly whatsappService;
    type: string;
    schema: AiAgentSchema;
    private readonly logger;
    constructor(prisma: PrismaService, businessAgent: BusinessAgentService, whatsappService: WhatsappService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
