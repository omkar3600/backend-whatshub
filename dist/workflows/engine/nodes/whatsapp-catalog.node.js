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
exports.WhatsAppCatalogExecutor = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("../../../whatsapp/whatsapp.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
let WhatsAppCatalogExecutor = class WhatsAppCatalogExecutor {
    prisma;
    whatsapp;
    type = 'whatsappCatalog';
    schema = {
        validate: () => { },
        getSchema: () => ({ type: 'object' }),
    };
    constructor(prisma, whatsapp) {
        this.prisma = prisma;
        this.whatsapp = whatsapp;
    }
    async getPhone(contactId) {
        const c = await this.prisma.contact.findUnique({ where: { id: contactId } });
        return c?.phone || null;
    }
    async execute(context, nodeData) {
        const phone = await this.getPhone(context.contactId);
        if (!phone)
            return { status: 'error', error: 'Contact phone missing' };
        const productTitle = nodeData.productTitle || 'Product Catalog Item';
        await this.whatsapp.sendOutboundMessage(context.shopId, phone, 'text', `🛍️ *${productTitle}*\n${nodeData.description || 'View details in catalog.'}`);
        return {
            status: 'continue',
            branch: 'success',
        };
    }
};
exports.WhatsAppCatalogExecutor = WhatsAppCatalogExecutor;
exports.WhatsAppCatalogExecutor = WhatsAppCatalogExecutor = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => whatsapp_service_1.WhatsappService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], WhatsAppCatalogExecutor);
//# sourceMappingURL=whatsapp-catalog.node.js.map