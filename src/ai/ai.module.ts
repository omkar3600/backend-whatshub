import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

// Providers
import { LlmProviderFactory } from './providers/llm-provider.factory';
import { GroqProvider } from './providers/groq.provider';

// Policy Engine
import { AiPolicyEngineService } from './policy/ai-policy-engine.service';

// Tools
import { ToolRegistry } from './tools/registry/tool.registry';
import { KnowledgeTools } from './tools/impl/knowledge-tools';
import { ContactTools } from './tools/impl/contact-tools';
import { ConversationTools } from './tools/impl/conversation-tools';
import { WhatsAppTools } from './tools/impl/whatsapp-tools';
import { CampaignTools } from './tools/impl/campaign-tools';
import { LeadTools } from './tools/impl/lead-tools';
import { AnalyticsTools } from './tools/impl/analytics-tools';
import { HandoffTool } from './tools/impl/handoff-tool';
import { ProductTools } from './tools/impl/product-tools';
import { SalesTools } from './tools/impl/sales-tools';
import { WorkflowTools } from './tools/impl/workflow-tools';
import { OwnerTools } from './tools/impl/owner-tools';

// Orchestrator
import { ContextBuilderService } from './orchestrator/context-builder.service';
import { MemoryManagerService } from './orchestrator/memory-manager.service';
import { AgentOrchestratorService } from './orchestrator/agent-orchestrator.service';
import { AgentSupervisorService } from './orchestrator/agent-supervisor.service';
import { AgentGoalManager } from './orchestrator/agent-goal.manager';

// Queue
import { AiJobProcessor } from './queue/ai-job.processor';

// Intelligence
import { LeadScoringService } from './intelligence/lead-scoring.service';
import { CustomerIntelligenceService } from './intelligence/customer-intelligence.service';
import { NextBestActionEngine } from './intelligence/next-best-action.service';

// Governance
import { AiGovernanceService } from './governance/ai-governance.service';
import { AiGovernanceController } from './governance/ai-governance.controller';

// Follow-up
import { FollowUpService } from './followup/followup.service';

// Business
import { BusinessAgentService } from './business/business-agent.service';
import { BusinessAgentController } from './business/business-agent.controller';

// Approvals
import { AiApprovalService } from './approvals/ai-approval.service';
import { AiApprovalController } from './approvals/ai-approval.controller';

// Knowledge
import { KnowledgeService } from './knowledge/knowledge.service';
import { KnowledgeController } from './knowledge/knowledge.controller';

// Dependencies
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { AdminModule } from '../admin/admin.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    AdminModule,
    BullModule.registerQueue({ name: 'ai-agent-queue' }),
    forwardRef(() => WhatsappModule),
    forwardRef(() => CampaignsModule),
    ChatModule,
  ],
  providers: [
    // Providers
    LlmProviderFactory,
    // Policy
    AiPolicyEngineService,
    // Tools
    ToolRegistry,
    KnowledgeTools,
    ContactTools,
    ConversationTools,
    WhatsAppTools,
    CampaignTools,
    LeadTools,
    AnalyticsTools,
    HandoffTool,
    ProductTools,
    SalesTools,
    WorkflowTools,
    OwnerTools,
    // Orchestrator
    ContextBuilderService,
    MemoryManagerService,
    AgentOrchestratorService,
    AgentSupervisorService,
    AgentGoalManager,
    // Queue processor
    AiJobProcessor,
    // Intelligence
    LeadScoringService,
    CustomerIntelligenceService,
    NextBestActionEngine,
    // Governance
    AiGovernanceService,
    // Follow-up
    FollowUpService,
    // Business
    BusinessAgentService,
    // Approvals
    AiApprovalService,
    // Knowledge
    KnowledgeService,
  ],
  controllers: [
    BusinessAgentController,
    AiApprovalController,
    KnowledgeController,
    AiGovernanceController,
  ],
  exports: [
    AgentOrchestratorService,
    AgentSupervisorService,
    AgentGoalManager,
    LeadScoringService,
    CustomerIntelligenceService,
    NextBestActionEngine,
    AiGovernanceService,
    AiPolicyEngineService,
    FollowUpService,
    ToolRegistry,
    LlmProviderFactory,
    AiJobProcessor,
    KnowledgeService,
  ],
})
export class AiModule {}
