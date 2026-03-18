import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WebhooksController } from './webhooks/webhooks.controller';
import { HttpModule } from '@nestjs/axios';
import { ChatbotModule } from '../chatbot/chatbot.module';

@Module({
  imports: [HttpModule, ChatbotModule],
  providers: [WhatsappService],
  controllers: [WebhooksController],
  exports: [WhatsappService],
})
export class WhatsappModule { }
