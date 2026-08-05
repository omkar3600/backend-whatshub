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
exports.KnowledgeTools = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let KnowledgeTools = class KnowledgeTools {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTools() {
        return [
            {
                name: 'search_knowledge',
                description: 'Search the business knowledge base for relevant information about products, policies, FAQs, pricing, or general business details.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'The search query' },
                        category: { type: 'string', enum: ['general', 'faq', 'policy', 'product', 'pricing'], description: 'Optional category filter' },
                    },
                    required: ['query'],
                },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    const where = { shopId: ctx.shopId, isActive: true };
                    if (params.category)
                        where.category = params.category;
                    const sources = await this.prisma.aiKnowledgeSource.findMany({ where, take: 5 });
                    const words = params.query.toLowerCase().split(/\s+/);
                    const scored = sources.map(s => ({
                        ...s,
                        relevance: words.filter(w => (s.title + s.content).toLowerCase().includes(w)).length,
                    })).sort((a, b) => b.relevance - a.relevance);
                    return {
                        success: true,
                        data: scored.slice(0, 3).map(s => ({ title: s.title, content: s.content.slice(0, 500), category: s.category })),
                    };
                },
            },
            {
                name: 'get_business_info',
                description: 'Get basic business information: name, contact, operating hours from business info.',
                inputSchema: { type: 'object', properties: {} },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx) => {
                    const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId: ctx.shopId } });
                    return { success: true, data: { businessInfo: config?.businessInfo || 'No business info configured.' } };
                },
            },
        ];
    }
};
exports.KnowledgeTools = KnowledgeTools;
exports.KnowledgeTools = KnowledgeTools = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KnowledgeTools);
//# sourceMappingURL=knowledge-tools.js.map