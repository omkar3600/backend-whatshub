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
export declare class AgentEventDispatcher {
    private readonly prisma;
    private readonly nextBestAction;
    private readonly orchestrator;
    private readonly policyEngine;
    private readonly logger;
    constructor(prisma: PrismaService, nextBestAction: NextBestActionEngine, orchestrator: AgentOrchestratorService, policyEngine: AiPolicyEngineService);
    dispatch(event: BusinessEvent): Promise<EventEvaluationResult>;
}
