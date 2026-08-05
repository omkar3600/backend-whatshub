import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
import { PrismaService } from '../../../prisma/prisma.service';
declare class TeamHandoffSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class TeamHandoffExecutor implements INodeExecutor {
    private readonly prisma;
    type: string;
    schema: TeamHandoffSchema;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
