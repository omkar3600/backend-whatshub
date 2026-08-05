import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NextBestActionEngine } from '../intelligence/next-best-action.service';
import { AgentOrchestratorService } from '../orchestrator/agent-orchestrator.service';
import { AiPolicyEngineService } from '../policy/ai-policy-engine.service';

export interface BusinessEvent {
  shopId: string;
  eventType: 'lead.created' | 'cart.abandoned' | 'order.delivered' | 'customer.inactive' | 'sentiment.angry';
  contactId: string;
  metadata?: Record<string, any>;
}

export interface EventEvaluationResult {
  acted: boolean;
  actionTaken?: string;
  reason: string;
  toolsUsed?: string[];
}

@Injectable()
export class AgentEventDispatcher {
  private readonly logger = new Logger(AgentEventDispatcher.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nextBestAction: NextBestActionEngine,
    private readonly orchestrator: AgentOrchestratorService,
    private readonly policyEngine: AiPolicyEngineService,
  ) {}

  async dispatch(event: BusinessEvent): Promise<EventEvaluationResult> {
    this.logger.log(`[EventDispatcher] Processing event ${event.eventType} for contact ${event.contactId} in shop ${event.shopId}`);

    const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId: event.shopId } });
    if (!config?.isActive || !config?.agentMode) {
      return { acted: false, reason: 'AI Agent is not active or agent mode is disabled.' };
    }

    // 1. Evaluate Next Best Action for this contact & event
    const prediction = await this.nextBestAction.predict(event.shopId, event.contactId);

    // 2. Check if agent decides DO_NOTHING
    if (prediction.action === 'DO_NOTHING' || prediction.confidence < 50) {
      this.logger.log(`[EventDispatcher] Agent decided DO_NOTHING for contact ${event.contactId} (confidence: ${prediction.confidence}%)`);
      return {
        acted: false,
        actionTaken: 'DO_NOTHING',
        reason: prediction.rationale || 'Next best action confidence below threshold or DO_NOTHING predicted.',
      };
    }

    // 3. Evaluate Policy & Autonomy Level
    const policyResult = await this.policyEngine.evaluateToolCall(
      event.shopId,
      prediction.recommendedTool || 'send_text_message',
      prediction.toolParams || {},
      config.autonomyLevel ?? 2
    );

    if (!policyResult.allowed) {
      this.logger.warn(`[EventDispatcher] Event action blocked by policy: ${policyResult.reason}`);
      return {
        acted: false,
        actionTaken: prediction.action,
        reason: policyResult.reason || 'Action blocked by business policy.',
      };
    }

    // 4. Run Agent Orchestrator to execute action or prompt
    const promptMessage = `System Trigger Event: ${event.eventType}. Recommended Action: ${prediction.action}. Context: ${prediction.rationale}`;
    
    // Find or create conversation for contact
    let conversation = await this.prisma.conversation.findUnique({
      where: { shopId_contactId: { shopId: event.shopId, contactId: event.contactId } },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          shopId: event.shopId,
          contactId: event.contactId,
        },
      });
    }

    const result = await this.orchestrator.run({
      shopId: event.shopId,
      contactId: event.contactId,
      conversationId: conversation.id,
      message: promptMessage,
    });

    return {
      acted: true,
      actionTaken: prediction.action,
      reason: prediction.rationale,
      toolsUsed: result.toolsUsed,
    };
  }
}
