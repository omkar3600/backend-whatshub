import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmProviderFactory } from '../providers/llm-provider.factory';

@Injectable()
export class MemoryManagerService {
  private readonly logger = new Logger(MemoryManagerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmFactory: LlmProviderFactory,
  ) {}

  async updateMemory(shopId: string, contactId: string, conversationId: string) {
    try {
      const recent = await this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { timestamp: 'desc' },
        take: 10,
      });
      if (recent.length < 3) return; // Not enough to extract memory

      const transcript = recent.reverse().map(m => `${m.direction === 'inbound' ? 'Customer' : 'AI'}: ${m.content}`).join('\n');

      const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
      if (!config?.isActive) return;

      const llm = await this.llmFactory.create(config);
      const response = await llm.generateCompletion([
        { role: 'system', content: 'Extract customer preferences, interests, and purchase signals from this conversation transcript. Return JSON with keys: interests (array of strings), preferredLanguage (string), budgetSignal (string: low/medium/high/unknown), productInterest (array of strings). Be concise.' },
        { role: 'user', content: transcript },
      ], [], { maxTokens: 256 });

      if (response.content) {
        let extracted: any = {};
        try { extracted = JSON.parse(response.content.replace(/```json\n?|```/g, '').trim()); } catch {}

        const existing = await this.prisma.aiMemory.findUnique({ where: { contactId } });
        const currentPrefs = (existing?.preferences as any) || {};
        await this.prisma.aiMemory.upsert({
          where: { contactId },
          create: { shopId, contactId, preferences: extracted },
          update: { preferences: { ...currentPrefs, ...extracted } },
        });
      }
    } catch (err: any) {
      this.logger.warn(`Memory update failed for contact ${contactId}: ${err.message}`);
    }
  }

  async generateSummary(shopId: string, conversationId: string) {
    try {
      const count = await this.prisma.message.count({ where: { conversationId } });
      if (count < 15) return; // Only summarize when conversation is long enough

      const msgs = await this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { timestamp: 'asc' },
        take: 30,
      });

      const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
      if (!config?.isActive) return;

      const transcript = msgs.map(m => `${m.direction === 'inbound' ? 'Customer' : 'AI'}: ${m.content}`).join('\n');
      const llm = await this.llmFactory.create(config);
      const response = await llm.generateCompletion([
        { role: 'system', content: 'Summarize this WhatsApp conversation in 2-3 sentences. Focus on what the customer asked, what was resolved, and any pending items.' },
        { role: 'user', content: transcript },
      ], [], { maxTokens: 200 });

      if (response.content) {
        const lastMsg = msgs[msgs.length - 1];
        await this.prisma.aiConversationSummary.create({
          data: {
            shopId,
            conversationId,
            summary: response.content,
            coveredUntil: lastMsg.timestamp,
            messageCount: msgs.length,
          },
        });
      }
    } catch (err: any) {
      this.logger.warn(`Summary generation failed for conversation ${conversationId}: ${err.message}`);
    }
  }
}
