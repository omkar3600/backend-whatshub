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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContactsService = class ContactsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createContact(shopId, data) {
        const { name, phone, tags, city, notes } = data;
        return this.prisma.contact.create({
            data: {
                shopId,
                name,
                phone,
                tags: tags || [],
                city,
                notes,
            },
        });
    }
    async getContacts(shopId, filters) {
        return this.prisma.contact.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getContact(shopId, id) {
        const contact = await this.prisma.contact.findFirst({
            where: { id, shopId },
        });
        if (!contact)
            throw new common_1.NotFoundException('Contact not found');
        return contact;
    }
    async updateContact(shopId, id, data) {
        const { name, phone, tags, city, notes } = data;
        return this.prisma.contact.update({
            where: { id, shopId },
            data: { name, phone, tags, city, notes },
        });
    }
    async deleteContact(shopId, id) {
        return this.prisma.contact.delete({
            where: { id, shopId },
        });
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map