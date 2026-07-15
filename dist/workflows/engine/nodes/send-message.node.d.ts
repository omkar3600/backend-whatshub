import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
import { WhatsappService } from '../../../whatsapp/whatsapp.service';
import { ExpressionEngineService } from '../expression-engine.service';
declare class SendMessageSchema implements INodeSchema {
    validate(config: any): void;
    getSchema(): any;
}
export declare class SendMessageExecutor implements INodeExecutor {
    private readonly whatsappService;
    private readonly expressionEngine;
    type: string;
    schema: SendMessageSchema;
    private readonly logger;
    constructor(whatsappService: WhatsappService, expressionEngine: ExpressionEngineService);
    execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult>;
}
export {};
