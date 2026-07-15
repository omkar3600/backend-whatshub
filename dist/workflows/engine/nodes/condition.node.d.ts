import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
import { ExpressionEngineService } from '../expression-engine.service';
declare class ConditionSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class ConditionExecutor implements INodeExecutor {
    private readonly expressionEngine;
    type: string;
    schema: ConditionSchema;
    private readonly logger;
    constructor(expressionEngine: ExpressionEngineService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
