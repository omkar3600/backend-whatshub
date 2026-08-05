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
exports.LeadTools = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let LeadTools = class LeadTools {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTools() {
        return [
            {
                name: 'get_lead_score',
                description: 'Get the AI-computed lead score (0-100) and pipeline stage for the current customer.',
                inputSchema: { type: 'object', properties: {} },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx) => {
                    if (!ctx.contactId)
                        return { success: false, error: 'No contact in context' };
                    const score = await this.prisma.aiLeadScore.findUnique({ where: { contactId: ctx.contactId } });
                    return { success: true, data: score || { score: 0, stage: 'NEW', intent: null } };
                },
            },
            {
                name: 'update_lead_stage',
                description: 'Update the pipeline stage for the current customer.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        stage: { type: 'string', enum: ['NEW', 'INTERESTED', 'QUALIFIED', 'PRODUCT_SELECTED', 'NEGOTIATING', 'PAYMENT_PENDING', 'PURCHASED', 'INACTIVE'] },
                        reason: { type: 'string', description: 'Reason for stage change' },
                    },
                    required: ['stage'],
                },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    if (!ctx.contactId)
                        return { success: false, error: 'No contact in context' };
                    await this.prisma.contact.update({ where: { id: ctx.contactId }, data: { aiLeadStage: params.stage } });
                    await this.prisma.aiLeadScore.upsert({
                        where: { contactId: ctx.contactId },
                        create: { shopId: ctx.shopId, contactId: ctx.contactId, stage: params.stage },
                        update: { stage: params.stage },
                    });
                    return { success: true, data: { stage: params.stage } };
                },
            },
            {
                name: 'get_hot_leads',
                description: 'Get top high-intent leads across the business (score >= threshold).',
                inputSchema: {
                    type: 'object',
                    properties: { threshold: { type: 'number', description: 'Minimum score (default 70)' }, limit: { type: 'number', description: 'Max results (default 10)' } },
                },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    const leads = await this.prisma.aiLeadScore.findMany({
                        where: { shopId: ctx.shopId, score: { gte: params.threshold || 70 } },
                        orderBy: { score: 'desc' },
                        take: params.limit || 10,
                        include: { contact: { select: { name: true, phone: true } } },
                    });
                    return { success: true, data: { count: leads.length, leads: leads.map(l => ({ name: l.contact.name, phone: l.contact.phone, score: l.score, stage: l.stage, intent: l.intent })) } };
                },
            },
        ];
    }
};
exports.LeadTools = LeadTools;
exports.LeadTools = LeadTools = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadTools);
//# sourceMappingURL=lead-tools.js.map