import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WebhooksController } from './webhooks/webhooks.controller';
import { HttpModule } from '@nestjs/axios';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { FlowsModule } from '../flows/flows.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [HttpModule, ChatbotModule, FlowsModule, ChatModule],
  providers: [WhatsappService],
  controllers: [WebhooksController],
  exports: [WhatsappService],
})
export class WhatsappModule { }
