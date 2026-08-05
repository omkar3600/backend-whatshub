import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
import { ExpressionEngineService } from '../expression-engine.service';
declare class DataTransformSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class DataTransformExecutor implements INodeExecutor {
    private readonly expressionEngine;
    type: string;
    schema: DataTransformSchema;
    private readonly logger;
    constructor(expressionEngine: ExpressionEngineService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
