import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
import { PrismaService } from '../../../prisma/prisma.service';
declare class CrmActionSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class CrmActionExecutor implements INodeExecutor {
    private readonly prisma;
    type: string;
    schema: CrmActionSchema;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
