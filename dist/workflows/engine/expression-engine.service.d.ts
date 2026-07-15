export declare class ExpressionEngineService {
    private readonly logger;
    private jexlInstance;
    constructor();
    private registerCustomFunctions;
    evaluateString(template: string, context: Record<string, any>): Promise<string>;
    evaluateCondition(expression: string, context: Record<string, any>): Promise<any>;
}
