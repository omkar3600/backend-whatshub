import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
import { ExpressionEngineService } from '../expression-engine.service';
import { HttpService } from '@nestjs/axios';
declare class HttpRequestSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class HttpRequestExecutor implements INodeExecutor {
    private readonly expressionEngine;
    private readonly httpService;
    type: string;
    schema: HttpRequestSchema;
    private readonly logger;
    constructor(expressionEngine: ExpressionEngineService, httpService: HttpService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
