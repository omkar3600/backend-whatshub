import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
import { WhatsappService } from '../../../whatsapp/whatsapp.service';
import { PrismaService } from '../../../prisma/prisma.service';
declare class AskQuestionSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class AskQuestionExecutor implements INodeExecutor {
    private readonly prisma;
    private readonly whatsappService;
    type: string;
    schema: AskQuestionSchema;
    private readonly logger;
    constructor(prisma: PrismaService, whatsappService: WhatsappService);
    private validateAnswer;
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
