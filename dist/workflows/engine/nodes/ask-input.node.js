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
exports.AskInputExecutor = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("../../../whatsapp/whatsapp.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AskInputExecutor = class AskInputExecutor {
    prisma;
    whatsapp;
    type = 'askInput';
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
        const promptText = nodeData.prompt || 'Please enter the requested information:';
        await this.whatsapp.sendOutboundMessage(context.shopId, phone, 'text', promptText);
        return {
            status: 'wait',
            resumeToken: `wait_input_${Date.now()}`,
        };
    }
};
exports.AskInputExecutor = AskInputExecutor;
exports.AskInputExecutor = AskInputExecutor = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => whatsapp_service_1.WhatsappService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], AskInputExecutor);
//# sourceMappingURL=ask-input.node.js.map