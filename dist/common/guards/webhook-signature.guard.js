"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebhookSignatureGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookSignatureGuard = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let WebhookSignatureGuard = WebhookSignatureGuard_1 = class WebhookSignatureGuard {
    logger = new common_1.Logger(WebhookSignatureGuard_1.name);
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const signature = request.headers['x-hub-signature-256'];
        const appSecret = process.env.META_APP_SECRET;
        if (!appSecret) {
            this.logger.warn('META_APP_SECRET not configured — skipping webhook signature verification');
            return true;
        }
        if (!signature) {
            this.logger.warn('Missing x-hub-signature-256 header on webhook request');
            throw new common_1.UnauthorizedException('Missing webhook signature');
        }
        const rawBody = request.rawBody;
        if (!rawBody) {
            this.logger.warn('Raw body not available for signature verification');
            throw new common_1.UnauthorizedException('Cannot verify webhook signature — raw body missing');
        }
        const expectedSignature = 'sha256=' + (0, crypto_1.createHmac)('sha256', appSecret)
            .update(rawBody)
            .digest('hex');
        const sigBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);
        if (sigBuffer.length !== expectedBuffer.length) {
            this.logger.warn('Webhook signature length mismatch');
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        }
        if (!(0, crypto_1.timingSafeEqual)(sigBuffer, expectedBuffer)) {
            this.logger.warn('Webhook signature verification failed');
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        }
        return true;
    }
};
exports.WebhookSignatureGuard = WebhookSignatureGuard;
exports.WebhookSignatureGuard = WebhookSignatureGuard = WebhookSignatureGuard_1 = __decorate([
    (0, common_1.Injectable)()
], WebhookSignatureGuard);
//# sourceMappingURL=webhook-signature.guard.js.map