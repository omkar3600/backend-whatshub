import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
import { PrismaService } from '../../../prisma/prisma.service';
declare class ApprovalSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class ApprovalExecutor implements INodeExecutor {
    private readonly prisma;
    type: string;
    schema: ApprovalSchema;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
