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
exports.IntegrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const messages_service_1 = require("../messages/messages.service");
const contacts_service_1 = require("../contacts/contacts.service");
const media_service_1 = require("../media/media.service");
let IntegrationService = class IntegrationService {
    prisma;
    messagesService;
    contactsService;
    mediaService;
    constructor(prisma, messagesService, contactsService, mediaService) {
        this.prisma = prisma;
        this.messagesService = messagesService;
        this.contactsService = contactsService;
        this.mediaService = mediaService;
    }
    async getOrCreateConversation(shopId, phone) {
        let contact = await this.prisma.contact.findUnique({
            where: { shopId_phone: { shopId, phone } }
        });
        if (!contact) {
            contact = await this.prisma.contact.create({
                data: {
                    shopId,
                    phone,
                    name: 'Unknown via API'
                }
            });
        }
        let conversation = await this.prisma.conversation.findUnique({
            where: { shopId_contactId: { shopId, contactId: contact.id } }
        });
        if (!conversation) {
            conversation = await this.prisma.conversation.create({
                data: {
                    shopId,
                    contactId: contact.id
                }
            });
        }
        return conversation;
    }
    async sendMessage(shopId, phone, text) {
        try {
            const conversation = await this.getOrCreateConversation(shopId, phone);
            const message = await this.messagesService.sendMessage(shopId, conversation.id, {
                type: 'text',
                content: text
            });
            return { success: true, messageId: message.id, status: 'queued' };
        }
        catch (e) {
            throw new common_1.BadRequestException('Failed to send message: ' + e.message);
        }
    }
    async sendMediaMessage(shopId, phone, file, caption) {
        try {
            const uploadedMedia = await this.mediaService.uploadFile(shopId, file);
            const conversation = await this.getOrCreateConversation(shopId, phone);
            const fileType = file.mimetype.startsWith('image/') ? 'image' : 'document';
            const message = await this.messagesService.sendMessage(shopId, conversation.id, {
                type: fileType,
                mediaUrl: uploadedMedia.fileUrl,
                content: caption || undefined
            });
            return { success: true, messageId: message.id, status: 'queued', mediaUrl: uploadedMedia.fileUrl };
        }
        catch (e) {
            throw new common_1.BadRequestException('Failed to send media message: ' + e.message);
        }
    }
    async syncContact(shopId, data) {
        const contact = await this.prisma.contact.upsert({
            where: { shopId_phone: { shopId, phone: data.phone } },
            update: { name: data.name },
            create: { shopId, phone: data.phone, name: data.name },
        });
        return { success: true, contactId: contact.id };
    }
};
exports.IntegrationService = IntegrationService;
exports.IntegrationService = IntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        messages_service_1.MessagesService,
        contacts_service_1.ContactsService,
        media_service_1.MediaService])
], IntegrationService);
//# sourceMappingURL=integration.service.js.map