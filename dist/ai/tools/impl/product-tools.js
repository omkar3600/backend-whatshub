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
exports.ProductTools = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ProductTools = class ProductTools {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTools() {
        return [
            {
                name: 'search_products',
                description: 'Search products in the business catalog or knowledge base by query, category, or price range.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'Product name or keyword to search for' },
                        category: { type: 'string', description: 'Product category' },
                        maxPrice: { type: 'number', description: 'Maximum price filter' },
                    },
                    required: ['query'],
                },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    const where = { shopId: ctx.shopId, isActive: true };
                    if (params.category)
                        where.category = params.category;
                    const sources = await this.prisma.aiKnowledgeSource.findMany({
                        where,
                        take: 10,
                    });
                    const qLower = params.query.toLowerCase();
                    const matched = sources
                        .filter(s => s.title.toLowerCase().includes(qLower) || s.content.toLowerCase().includes(qLower))
                        .map(s => ({
                        id: s.id,
                        title: s.title,
                        category: s.category,
                        details: s.content.slice(0, 300),
                    }));
                    return {
                        success: true,
                        data: {
                            count: matched.length,
                            products: matched,
                            query: params.query,
                        },
                    };
                },
            },
            {
                name: 'check_stock',
                description: 'Check stock availability and inventory details for a specific product or SKU.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productName: { type: 'string', description: 'Name or title of product' },
                    },
                    required: ['productName'],
                },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    const item = await this.prisma.aiKnowledgeSource.findFirst({
                        where: {
                            shopId: ctx.shopId,
                            isActive: true,
                            title: { contains: params.productName, mode: 'insensitive' },
                        },
                    });
                    if (!item) {
                        return { success: false, error: `Product '${params.productName}' not found in catalog.` };
                    }
                    return {
                        success: true,
                        data: {
                            product: item.title,
                            inStock: true,
                            stockLevel: 'Available',
                            summary: item.content.slice(0, 200),
                        },
                    };
                },
            },
            {
                name: 'get_product_details',
                description: 'Get complete specifications, pricing, and details for a product.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productId: { type: 'string', description: 'Knowledge source or product ID' },
                    },
                    required: ['productId'],
                },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    const item = await this.prisma.aiKnowledgeSource.findFirst({
                        where: { id: params.productId, shopId: ctx.shopId },
                    });
                    if (!item)
                        return { success: false, error: 'Product not found' };
                    return {
                        success: true,
                        data: {
                            id: item.id,
                            title: item.title,
                            category: item.category,
                            fullDetails: item.content,
                        },
                    };
                },
            },
        ];
    }
};
exports.ProductTools = ProductTools;
exports.ProductTools = ProductTools = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductTools);
//# sourceMappingURL=product-tools.js.map