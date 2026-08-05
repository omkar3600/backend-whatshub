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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationTools = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ConversationTools = class ConversationTools {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTools() {
        return [
            {
                name: 'get_conversation_history',
                description: 'Get recent message history for the current conversation. Returns the last N messages.',
                inputSchema: {
                    type: 'object',
                    properties: { limit: { type: 'number', description: 'Number of messages to return (default 10, max 30)' } },
                },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    if (!ctx.conversationId)
                        return { success: false, error: 'No conversation in context' };
                    const limit = Math.min(params.limit || 10, 30);
                    const messages = await this.prisma.message.findMany({
                        where: { conversationId: ctx.conversationId },
                        orderBy: { timestamp: 'desc' },
                        take: limit,
                    });
                    return { success: true, data: { messages: messages.reverse().map(m => ({ direction: m.direction, content: m.content, type: m.type, timestamp: m.timestamp })) } };
                },
            },
            {
                name: 'get_conversation_summary',
                description: 'Get the AI-generated summary of the conversation history to understand what has been discussed.',
                inputSchema: { type: 'object', properties: {} },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx) => {
                    if (!ctx.conversationId)
                        return { success: false, error: 'No conversation in context' };
                    const summary = await this.prisma.aiConversationSummary.findFirst({
                        where: { conversationId: ctx.conversationId },
                        orderBy: { createdAt: 'desc' },
                    });
                    return { success: true, data: { summary: summary?.summary || 'No summary available yet.' } };
                },
            },
        ];
    }
};
exports.ConversationTools = ConversationTools;
exports.ConversationTools = ConversationTools = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConversationTools);
//# sourceMappingURL=conversation-tools.js.map