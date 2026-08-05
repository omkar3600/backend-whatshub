import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmProviderFactory } from '../providers/llm-provider.factory';
import { ToolRegistry } from '../tools/registry/tool.registry';
import { ToolContext } from '../tools/tool.interface';
import { LlmMessage } from '../providers/llm-provider.interface';

@Injectable()
export class BusinessAgentService {
  private readonly logger = new Logger(BusinessAgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmFactory: LlmProviderFactory,
    private readonly toolRegistry: ToolRegistry,
  ) {}

  async query(shopId: string, question: string): Promise<{ answer: string; data?: any }> {
    const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
    if (!config?.isActive) {
      return { answer: 'AI is not configured for your business. Please enable it in Chatbot settings.' };
    }

    const llm = await this.llmFactory.create(config);

    // Business owner tools: analytics, leads, campaigns (no customer-facing tools)
    const businessToolNames = ['get_conversation_stats', 'get_lead_pipeline_summary', 'get_campaign_stats', 'get_campaigns', 'get_hot_leads', 'search_contacts', 'get_business_info'];
    const tools = businessToolNames.map(n => this.toolRegistry.get(n)).filter(Boolean) as any[];
    const toolDefs = tools.map(t => ({ name: t.name, description: t.description, parameters: t.inputSchema }));

    const toolCtx: ToolContext = { shopId }; // No contactId for owner queries

    const messages: LlmMessage[] = [
      {
        role: 'system',
        content: `You are an AI business intelligence assistant for a WhatsApp business. Answer the owner's questions using the available tools. Be concise and data-driven. Today's date: ${new Date().toLocaleDateString('en-IN')}.`,
      },
      { role: 'user', content: question },
    ];

    for (let i = 0; i < 5; i++) {
      const response = await llm.generateCompletion(messages, toolDefs, { temperature: 0.2 });

      if (!response.toolCalls.length || response.finishReason === 'stop') {
        return { answer: response.content || 'No data available.' };
      }

      messages.push({ role: 'assistant', content: response.content || '' } as any);

      for (const tc of response.toolCalls) {
        const tool = tools.find(t => t.name === tc.name);
        if (!tool) continue;
        const result = await tool.execute(toolCtx, tc.arguments);
        messages.push({ role: 'tool', content: JSON.stringify(result.data || result), tool_call_id: tc.id, name: tc.name });
      }
    }

    return { answer: 'I was unable to retrieve the information at this time.' };
  }
}
