import { Module, forwardRef } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WebhooksController } from './webhooks/webhooks.controller';
import { WhatsappController } from './whatsapp.controller';
import { HttpModule } from '@nestjs/axios';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { ChatModule } from '../chat/chat.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    HttpModule,
    ChatbotModule,
    ChatModule,
    forwardRef(() => WorkflowsModule),
    BullModule.registerQueue({ name: 'ai-agent-queue' }),
  ],
  providers: [WhatsappService],
  controllers: [WebhooksController, WhatsappController],
  exports: [WhatsappService],
})
export class WhatsappModule { }
