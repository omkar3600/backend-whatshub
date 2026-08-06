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
var NtfyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NtfyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let NtfyService = NtfyService_1 = class NtfyService {
    configService;
    logger = new common_1.Logger(NtfyService_1.name);
    ntfyUrl;
    defaultTopic;
    constructor(configService) {
        this.configService = configService;
        this.ntfyUrl = this.configService.get('NTFY_URL') || 'https://ntfy.sh';
        this.defaultTopic = this.configService.get('NTFY_TOPIC') || 'whatshub-alerts';
    }
    async sendAlert(options) {
        const topic = options.topic || this.defaultTopic;
        const targetUrl = `${this.ntfyUrl.replace(/\/$/, '')}/${topic}`;
        try {
            await axios_1.default.post(targetUrl, options.message, {
                headers: {
                    Title: options.title,
                    Priority: String(options.priority || 3),
                    Tags: (options.tags || ['message', 'bell']).join(','),
                    ...(options.actionUrl ? { Click: options.actionUrl } : {}),
                },
                timeout: 5000,
            });
            this.logger.log(`[ntfy] Published push alert to topic '${topic}': ${options.title}`);
            return true;
        }
        catch (err) {
            this.logger.warn(`[ntfy] Failed to send alert to '${topic}': ${err.message}`);
            return false;
        }
    }
    async notifyPendingAiAction(action) {
        return this.sendAlert({
            title: `⚠️ AI Approval Required [${action.riskLevel}]`,
            message: `Tool '${action.toolName}' requested execution. ${action.rationale.slice(0, 100)}`,
            priority: action.riskLevel === 'CRITICAL' || action.riskLevel === 'HIGH' ? 5 : 3,
            tags: ['warning', 'robot', 'shield'],
            actionUrl: `https://whatshub-frontend2.vercel.app/ai-agent/actions`,
        });
    }
    async notifyCampaignCompleted(campaign) {
        return this.sendAlert({
            title: `🚀 Broadcast Campaign Finished`,
            message: `'${campaign.name}' completed. Sent: ${campaign.totalSent}, Failed: ${campaign.totalFailed}`,
            priority: 3,
            tags: ['tada', 'megaphone'],
            actionUrl: `https://whatshub-frontend2.vercel.app/campaigns/${campaign.id}`,
        });
    }
};
exports.NtfyService = NtfyService;
exports.NtfyService = NtfyService = NtfyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NtfyService);
//# sourceMappingURL=ntfy.service.js.map