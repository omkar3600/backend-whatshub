import { Module, forwardRef } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WebhooksController } from './webhooks/webhooks.controller';
import { WhatsappController } from './whatsapp.controller';
import { HttpModule } from '@nestjs/axios';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { FlowsModule } from '../flows/flows.module';
import { ChatModule } from '../chat/chat.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [HttpModule, ChatbotModule, forwardRef(() => FlowsModule), ChatModule, forwardRef(() => WorkflowsModule)],
  providers: [WhatsappService],
  controllers: [WebhooksController, WhatsappController],
  exports: [WhatsappService],
})
export class WhatsappModule { }
