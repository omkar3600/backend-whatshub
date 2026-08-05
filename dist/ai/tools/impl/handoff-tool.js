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
exports.HandoffTool = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let HandoffTool = class HandoffTool {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTools() {
        return [
            {
                name: 'escalate_to_human',
                description: 'Hand off the conversation to a human agent. Use when: customer is frustrated, request is too complex, customer explicitly asks for human, or you cannot resolve the issue. This pauses AI responses.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        reason: { type: 'string', description: 'Brief reason for escalation' },
                        summary: { type: 'string', description: 'Summary of what was discussed and what the customer needs' },
                    },
                    required: ['reason'],
                },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    if (!ctx.conversationId)
                        return { success: false, error: 'No conversation in context' };
                    await this.prisma.conversation.update({
                        where: { id: ctx.conversationId },
                        data: { aiPaused: true },
                    });
                    if (ctx.contactId) {
                        const contact = await this.prisma.contact.findUnique({ where: { id: ctx.contactId } });
                        const escalationNote = `[AI Escalation ${new Date().toLocaleDateString()}] Reason: ${params.reason}${params.summary ? `. Summary: ${params.summary}` : ''}`;
                        const notes = [contact?.notes, escalationNote].filter(Boolean).join('\n');
                        await this.prisma.contact.update({ where: { id: ctx.contactId }, data: { notes } });
                    }
                    return { success: true, data: { paused: true, reason: params.reason } };
                },
            },
        ];
    }
};
exports.HandoffTool = HandoffTool;
exports.HandoffTool = HandoffTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HandoffTool);
//# sourceMappingURL=handoff-tool.js.map