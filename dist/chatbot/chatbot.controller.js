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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotController = void 0;
const common_1 = require("@nestjs/common");
const chatbot_service_1 = require("./chatbot.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ChatbotController = class ChatbotController {
    chatbotService;
    constructor(chatbotService) {
        this.chatbotService = chatbotService;
    }
    async getConfig(req) {
        const shopId = req.user.shopId;
        const config = await this.chatbotService.getConfig(shopId);
        if (!config)
            return { isActive: false, model: 'gemini-1.5-flash', temperature: 0.7, systemPrompt: '', businessInfo: '', apiKey: '' };
        return {
            ...config,
            apiKey: config.apiKey ? `****${config.apiKey.slice(-4)}` : '',
        };
    }
    async updateConfig(req, body) {
        const shopId = req.user.shopId;
        const data = { ...body };
        if (data.apiKey) {
            data.apiKey = data.apiKey.trim();
        }
        if (data.apiKey?.startsWith('****')) {
            delete data.apiKey;
        }
        return this.chatbotService.upsertConfig(shopId, data);
    }
    async togglePause(req, conversationId, paused) {
        const shopId = req.user.shopId;
        await this.chatbotService.toggleAiPause(shopId, conversationId, paused);
        return { success: true, conversationId, aiPaused: paused };
    }
    async testConnection(req, message) {
        const shopId = req.user.shopId;
        const config = await this.chatbotService.getConfig(shopId);
        if (!config?.apiKey)
            return { success: false, message: 'No API key configured.' };
        const userMessage = message?.trim() || 'Hello! Please introduce yourself in one sentence.';
        const reply = await this.chatbotService.generateResponse(shopId, 'Test User', userMessage);
        if (reply.text)
            return { success: true, reply: reply.text };
        return { success: false, message: `AI Error: ${reply.error}` };
    }
};
exports.ChatbotController = ChatbotController;
__decorate([
    (0, common_1.Get)('config'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)('config'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Patch)('conversations/:conversationId/pause'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __param(2, (0, common_1.Body)('paused')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "togglePause", null);
__decorate([
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('message')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "testConnection", null);
exports.ChatbotController = ChatbotController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('chatbot'),
    __metadata("design:paramtypes", [chatbot_service_1.ChatbotService])
], ChatbotController);
//# sourceMappingURL=chatbot.controller.js.map