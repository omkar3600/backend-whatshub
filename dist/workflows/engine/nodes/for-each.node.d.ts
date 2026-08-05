import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
declare class ForEachSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class ForEachExecutor implements INodeExecutor {
    type: string;
    schema: ForEachSchema;
    private readonly logger;
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
