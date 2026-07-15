import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
declare class DelaySchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class DelayExecutor implements INodeExecutor {
    type: string;
    schema: DelaySchema;
    private readonly logger;
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
