import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

// Providers
import { LlmProviderFactory } from './providers/llm-provider.factory';

// Tools
import { ToolRegistry } from './tools/registry/tool.registry';

// Services & Controllers
import { BusinessAgentService } from './business/business-agent.service';
import { BusinessAgentController } from './business/business-agent.controller';

import { KnowledgeService } from './knowledge/knowledge.service';
import { KnowledgeController } from './knowledge/knowledge.controller';

import { FollowUpService } from './followup/followup.service';

// Dependencies
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { AdminModule } from '../admin/admin.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    AdminModule,
    BullModule.registerQueue({ name: 'ai-agent-queue' }),
    forwardRef(() => WhatsappModule),
  ],
  providers: [
    LlmProviderFactory,
    ToolRegistry,
    BusinessAgentService,
    KnowledgeService,
    FollowUpService,
  ],
  controllers: [
    BusinessAgentController,
    KnowledgeController,
  ],
  exports: [
    BusinessAgentService,
    KnowledgeService,
    FollowUpService,
    LlmProviderFactory,
    ToolRegistry,
  ],
})
export class AiModule {}
