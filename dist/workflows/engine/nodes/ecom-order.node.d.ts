import { INodeExecutor, INodeSchema, ExecutionContext, ExecutionResult } from '../interfaces/node-executor.interface';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class EcomOrderExecutor implements INodeExecutor {
    private readonly prisma;
    type: string;
    schema: INodeSchema;
    constructor(prisma: PrismaService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
