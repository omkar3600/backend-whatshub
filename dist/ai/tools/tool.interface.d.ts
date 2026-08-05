export type RiskLevel = 'READ_ONLY' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    idempotencyKey?: string;
}
export interface ToolContext {
    shopId: string;
    contactId?: string;
    conversationId?: string;
    agentRole?: string;
    permissions?: string[];
}
export interface AiTool {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
    riskLevel: RiskLevel;
    permissions?: string[];
    requiresApproval: (autonomyLevel: number) => boolean;
    execute(context: ToolContext, params: any): Promise<ToolResult>;
}
