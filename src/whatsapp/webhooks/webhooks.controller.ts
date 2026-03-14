import { Controller, Get, Post, Body, Query, Res, HttpStatus, Logger } from '@nestjs/common';
import { WhatsappService } from '../whatsapp.service';
import type { Response } from 'express';

@Controller('webhooks/whatsapp')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);
    constructor(private readonly whatsappService: WhatsappService) { }

    @Get()
    async verifyWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
        @Query('shopId') shopId: string, // Unique per-shop verification
        @Res() res: Response,
    ) {
        this.logger.log(`Webhook Verification — mode: ${mode}, shopId: ${shopId}`);

        const verifiedChallenge = await this.whatsappService.verifyWebhook(mode, token, challenge, shopId);
        if (verifiedChallenge) {
            this.logger.log('Verification Success.');
            return res.status(HttpStatus.OK).end(verifiedChallenge);
        }
        this.logger.warn('Verification Failed. Token mismatch or invalid mode.');
        return res.status(HttpStatus.FORBIDDEN).end();
    }

    @Post()
    async handleIncomingEvent(@Body() body: any, @Res() res: Response) {
        // Ack immediately to prevent Meta from retrying
        res.status(HttpStatus.OK).send('EVENT_RECEIVED');

        try {
            await this.whatsappService.processWebhookEvent(body);
        } catch (error) {
            this.logger.error('Error processing webhook event:', error.message);
        }
    }
}
