import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
declare class AbTestSplitterSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class AbTestSplitterExecutor implements INodeExecutor {
    type: string;
    schema: AbTestSplitterSchema;
    private readonly logger;
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
