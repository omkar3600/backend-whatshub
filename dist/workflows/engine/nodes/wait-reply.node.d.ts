import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
declare class WaitReplySchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class WaitReplyExecutor implements INodeExecutor {
    type: string;
    schema: WaitReplySchema;
    private readonly logger;
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
