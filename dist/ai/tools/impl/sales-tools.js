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
exports.SalesTools = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let SalesTools = class SalesTools {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTools() {
        return [
            {
                name: 'create_cart',
                description: 'Initialize a shopping cart for the current customer contact.',
                inputSchema: { type: 'object', properties: {} },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx) => {
                    if (!ctx.contactId)
                        return { success: false, error: 'No contact in context' };
                    const memory = await this.prisma.aiMemory.upsert({
                        where: { contactId: ctx.contactId },
                        create: {
                            shopId: ctx.shopId,
                            contactId: ctx.contactId,
                            preferences: { cart: [] },
                        },
                        update: {
                            preferences: { cart: [] },
                        },
                    });
                    return {
                        success: true,
                        data: { message: 'Cart initialized', cartId: memory.id, items: [] },
                    };
                },
            },
            {
                name: 'add_to_cart',
                description: 'Add a product item with quantity to the customer\'s active shopping cart.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemTitle: { type: 'string', description: 'Title or name of the product' },
                        quantity: { type: 'number', description: 'Quantity to add' },
                        unitPrice: { type: 'number', description: 'Optional unit price' },
                    },
                    required: ['itemTitle', 'quantity'],
                },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    if (!ctx.contactId)
                        return { success: false, error: 'No contact in context' };
                    const memory = await this.prisma.aiMemory.findUnique({ where: { contactId: ctx.contactId } });
                    const existingPrefs = memory?.preferences || {};
                    const currentCart = Array.isArray(existingPrefs.cart) ? existingPrefs.cart : [];
                    const newItem = {
                        id: `item_${Date.now()}`,
                        title: params.itemTitle,
                        quantity: params.quantity,
                        price: params.unitPrice || 0,
                        addedAt: new Date().toISOString(),
                    };
                    const updatedCart = [...currentCart, newItem];
                    await this.prisma.aiMemory.upsert({
                        where: { contactId: ctx.contactId },
                        create: {
                            shopId: ctx.shopId,
                            contactId: ctx.contactId,
                            preferences: { ...existingPrefs, cart: updatedCart },
                        },
                        update: {
                            preferences: { ...existingPrefs, cart: updatedCart },
                        },
                    });
                    return {
                        success: true,
                        data: {
                            message: `Added ${params.quantity}x ${params.itemTitle} to cart`,
                            cartCount: updatedCart.length,
                            cartItems: updatedCart,
                        },
                    };
                },
            },
            {
                name: 'create_order',
                description: 'Create a draft order for the customer. High-value orders require business owner approval depending on autonomy setting.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        itemSummary: { type: 'string', description: 'Summary of ordered items' },
                        totalAmount: { type: 'number', description: 'Total price amount' },
                        shippingAddress: { type: 'string', description: 'Delivery/Shipping address' },
                    },
                    required: ['itemSummary', 'totalAmount'],
                },
                riskLevel: 'MEDIUM',
                requiresApproval: (autonomyLevel) => autonomyLevel < 2,
                execute: async (ctx, params) => {
                    if (!ctx.contactId)
                        return { success: false, error: 'No contact in context' };
                    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
                    await this.prisma.contact.update({
                        where: { id: ctx.contactId },
                        data: { aiLeadStage: 'PAYMENT_PENDING' },
                    });
                    await this.prisma.aiLeadScore.upsert({
                        where: { contactId: ctx.contactId },
                        create: {
                            shopId: ctx.shopId,
                            contactId: ctx.contactId,
                            score: 95,
                            stage: 'PAYMENT_PENDING',
                            intent: 'HIGH_PURCHASE_INTENT',
                        },
                        update: {
                            score: 95,
                            stage: 'PAYMENT_PENDING',
                            intent: 'HIGH_PURCHASE_INTENT',
                        },
                    });
                    return {
                        success: true,
                        data: {
                            orderId,
                            status: 'DRAFT_CREATED',
                            itemSummary: params.itemSummary,
                            totalAmount: params.totalAmount,
                            shippingAddress: params.shippingAddress || 'To be confirmed',
                            message: `Order ${orderId} created successfully for amount ₹${params.totalAmount}`,
                        },
                    };
                },
            },
            {
                name: 'get_order_status',
                description: 'Retrieve order status and tracking info for an order ID.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        orderId: { type: 'string', description: 'The order ID to check' },
                    },
                    required: ['orderId'],
                },
                riskLevel: 'LOW',
                requiresApproval: () => false,
                execute: async (ctx, params) => {
                    return {
                        success: true,
                        data: {
                            orderId: params.orderId,
                            status: 'PROCESSING',
                            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
                            message: `Order ${params.orderId} is currently being processed and prepared for shipping.`,
                        },
                    };
                },
            },
        ];
    }
};
exports.SalesTools = SalesTools;
exports.SalesTools = SalesTools = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesTools);
//# sourceMappingURL=sales-tools.js.map