import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
import { WhatsappService } from '../../../whatsapp/whatsapp.service';
import { PrismaService } from '../../../prisma/prisma.service';
declare class ForwardToOwnerSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class ForwardToOwnerExecutor implements INodeExecutor {
    private readonly whatsappService;
    private readonly prisma;
    type: string;
    schema: ForwardToOwnerSchema;
    private readonly logger;
    constructor(whatsappService: WhatsappService, prisma: PrismaService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
