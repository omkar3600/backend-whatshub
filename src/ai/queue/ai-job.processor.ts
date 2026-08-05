import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AgentOrchestratorService } from '../orchestrator/agent-orchestrator.service';
import { WhatsappService } from '../../whatsapp/whatsapp.service';
import { ChatGateway } from '../../chat/chat.gateway';
import { MemoryManagerService } from '../orchestrator/memory-manager.service';
import { LeadScoringService } from '../intelligence/lead-scoring.service';
import { FollowUpService } from '../followup/followup.service';

@Processor('ai-agent-queue')
@Injectable()
export class AiJobProcessor extends WorkerHost {
  private readonly logger = new Logger(AiJobProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: AgentOrchestratorService,
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsapp: WhatsappService,
    private readonly chatGateway: ChatGateway,
    private readonly memoryManager: MemoryManagerService,
    private readonly leadScoring: LeadScoringService,
    private readonly followUp: FollowUpService,
  ) { super(); }

  async process(job: Job): Promise<void> {
    const { name, data } = job;

    if (name === 'process-agent-message') {
      await this.processAgentMessage(data);
    } else if (name === 'score-lead') {
      await this.leadScoring.scoreContact(data.shopId, data.contactId, data.conversationId);
    } else if (name === 'send-followup') {
      await this.followUp.executeFollowUp(data.followUpId);
    } else if (name === 'update-memory') {
      await this.memoryManager.updateMemory(data.shopId, data.contactId, data.conversationId);
      await this.memoryManager.generateSummary(data.shopId, data.conversationId);
    }
  }

  private async processAgentMessage(data: {
    shopId: string;
    contactId: string;
    conversationId: string;
    messageText: string;
    contactPhone: string;
  }) {
    try {
      const result = await this.orchestrator.run({
        shopId: data.shopId,
        contactId: data.contactId,
        conversationId: data.conversationId,
        message: data.messageText,
      });

      if (result.text) {
        const metaRes = await this.whatsapp.sendOutboundMessage(data.shopId, data.contactPhone, 'text', result.text);
        const wamid = metaRes?.messages?.[0]?.id;

        const contact = await this.prisma.contact.findUnique({ where: { id: data.contactId } });
        const savedMsg = await this.prisma.message.create({
          data: {
            id: wamid || undefined,
            shopId: data.shopId,
            conversationId: data.conversationId,
            direction: 'outbound',
            type: 'text',
            content: result.text,
            status: 'sent',
          },
        });

        this.chatGateway.notifyNewMessage(data.shopId, {
          ...savedMsg,
          contact: { name: contact?.name, phone: contact?.phone },
        });

        await this.prisma.conversation.update({
          where: { id: data.conversationId },
          data: { lastMessageAt: new Date(), lastAiInteractionAt: new Date() } as any,
        }).catch(() => {});

        await this.prisma.contact.update({
          where: { id: data.contactId },
          data: { lastAiInteractionAt: new Date() },
        }).catch(() => {});
      }

      // Emit pending actions to frontend
      if (result.actionsQueued.length > 0) {
        this.chatGateway.server?.to(data.shopId).emit('newAiAction', {
          shopId: data.shopId,
          tools: result.actionsQueued,
        });
      }

    } catch (err: any) {
      this.logger.error(`[AI Agent] Failed to process message for shop ${data.shopId}: ${err.message}`);
    }
  }
}
