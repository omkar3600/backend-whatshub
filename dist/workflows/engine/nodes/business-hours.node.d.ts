import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
import { PrismaService } from '../../../prisma/prisma.service';
declare class BusinessHoursSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class BusinessHoursExecutor implements INodeExecutor {
    private readonly prisma;
    type: string;
    schema: BusinessHoursSchema;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
