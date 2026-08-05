export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ToolContext {
  shopId: string;          // ALWAYS from server context, never from LLM
  contactId?: string;
  conversationId?: string;
}

export interface AiTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>; // JSON Schema
  riskLevel: RiskLevel;
  requiresApproval: (autonomyLevel: number) => boolean;
  execute(context: ToolContext, params: any): Promise<ToolResult>;
}
