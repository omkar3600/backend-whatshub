import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmProviderFactory } from '../providers/llm-provider.factory';
import { ChatGateway } from '../../chat/chat.gateway';

@Injectable()
export class LeadScoringService {
  private readonly logger = new Logger(LeadScoringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmFactory: LlmProviderFactory,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async scoreContact(shopId: string, contactId: string, conversationId: string) {
    try {
      const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
      if (!config?.isActive) return;

      const messages = await this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { timestamp: 'desc' },
        take: 20,
      });
      if (messages.length < 2) return;

      const transcript = messages.reverse().map(m => `${m.direction === 'inbound' ? 'Customer' : 'AI'}: ${m.content}`).join('\n');

      const llm = await this.llmFactory.create(config);
      const response = await llm.generateCompletion([
        {
          role: 'system',
          content: `You are a sales intelligence analyst. Analyze this WhatsApp conversation and return a JSON object with:
- score (integer 0-100): purchase intent score
- stage (one of: NEW, INTERESTED, QUALIFIED, PRODUCT_SELECTED, NEGOTIATING, PAYMENT_PENDING, PURCHASED, INACTIVE)
- intent (string, 1 sentence describing what customer wants)
- sentiment (positive, neutral, or negative)
- urgency (low, medium, or high)
- followUpRequired (boolean, true if customer has shown interest but hasn't committed)
Return ONLY valid JSON.`,
        },
        { role: 'user', content: transcript },
      ], [], { maxTokens: 300, temperature: 0.2 });

      if (!response.content) return;

      let scored: any;
      try {
        scored = JSON.parse(response.content.replace(/```json\n?|```/g, '').trim());
      } catch {
        this.logger.warn(`Failed to parse lead score JSON: ${response.content}`);
        return;
      }

      const prevScore = await this.prisma.aiLeadScore.findUnique({ where: { contactId } });
      const newScore = await this.prisma.aiLeadScore.upsert({
        where: { contactId },
        create: { shopId, contactId, ...scored, lastScoredAt: new Date() },
        update: { ...scored, lastScoredAt: new Date() },
      });

      // Update contact stage
      await this.prisma.contact.update({ where: { id: contactId }, data: { aiLeadStage: scored.stage } }).catch(() => {});

      // Emit hot lead event if threshold crossed
      const threshold = config.hotLeadThreshold ?? 70;
      if (newScore.score >= threshold && (!prevScore || prevScore.score < threshold)) {
        const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
        this.chatGateway.server?.to(shopId).emit('hotLead', {
          contactId,
          name: contact?.name,
          phone: contact?.phone,
          score: newScore.score,
          intent: scored.intent,
        });
        this.logger.log(`[Lead] Hot lead detected: ${contact?.name} (score: ${newScore.score}) for shop ${shopId}`);
      }
    } catch (err: any) {
      this.logger.warn(`Lead scoring failed for ${contactId}: ${err.message}`);
    }
  }
}
