"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhooksController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("../whatsapp.service");
let WebhooksController = WebhooksController_1 = class WebhooksController {
    whatsappService;
    logger = new common_1.Logger(WebhooksController_1.name);
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    async verifyWebhook(mode, token, challenge, shopId, res) {
        this.logger.log(`Webhook Verification — mode: ${mode}, shopId: ${shopId}`);
        const verifiedChallenge = await this.whatsappService.verifyWebhook(mode, token, challenge, shopId);
        if (verifiedChallenge) {
            this.logger.log('Verification Success.');
            return res.status(common_1.HttpStatus.OK).end(verifiedChallenge);
        }
        this.logger.warn('Verification Failed. Token mismatch or invalid mode.');
        return res.status(common_1.HttpStatus.FORBIDDEN).end();
    }
    async handleIncomingEvent(body, res) {
        res.status(common_1.HttpStatus.OK).send('EVENT_RECEIVED');
        try {
            await this.whatsappService.processWebhookEvent(body);
        }
        catch (error) {
            this.logger.error('Error processing webhook event:', error.message);
        }
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __param(3, (0, common_1.Query)('shopId')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleIncomingEvent", null);
exports.WebhooksController = WebhooksController = WebhooksController_1 = __decorate([
    (0, common_1.Controller)('webhooks/whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map