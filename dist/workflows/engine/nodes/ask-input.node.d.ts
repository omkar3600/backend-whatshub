import { INodeExecutor, INodeSchema, ExecutionContext, ExecutionResult } from '../interfaces/node-executor.interface';
import { WhatsappService } from '../../../whatsapp/whatsapp.service';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class AskInputExecutor implements INodeExecutor {
    private readonly prisma;
    private readonly whatsapp;
    type: string;
    schema: INodeSchema;
    constructor(prisma: PrismaService, whatsapp: WhatsappService);
    private getPhone;
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
