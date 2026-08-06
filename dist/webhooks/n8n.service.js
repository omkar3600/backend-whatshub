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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var N8nWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nWebhookService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let N8nWebhookService = N8nWebhookService_1 = class N8nWebhookService {
    configService;
    logger = new common_1.Logger(N8nWebhookService_1.name);
    n8nWebhookUrl;
    constructor(configService) {
        this.configService = configService;
        this.ntfyUrl = this.configService.get('N8N_WEBHOOK_URL') || '';
    }
    ntfyUrl;
    async dispatchN8nEvent(eventType, data) {
        const targetUrl = this.configService.get('N8N_WEBHOOK_URL');
        if (!targetUrl) {
            this.logger.debug(`[n8n] N8N_WEBHOOK_URL is not set. Skipping event dispatch for '${eventType}'.`);
            return false;
        }
        const payload = {
            event: eventType,
            timestamp: new Date().toISOString(),
            data,
        };
        try {
            await axios_1.default.post(targetUrl, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000,
            });
            this.logger.log(`[n8n] Successfully dispatched '${eventType}' event to n8n workflow.`);
            return true;
        }
        catch (err) {
            this.logger.warn(`[n8n] Failed to dispatch '${eventType}' event to n8n: ${err.message}`);
            return false;
        }
    }
};
exports.N8nWebhookService = N8nWebhookService;
exports.N8nWebhookService = N8nWebhookService = N8nWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], N8nWebhookService);
//# sourceMappingURL=n8n.service.js.map