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
var ShopsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_service_1 = require("../common/services/crypto.service");
let ShopsService = ShopsService_1 = class ShopsService {
    prisma;
    cryptoService;
    logger = new common_1.Logger(ShopsService_1.name);
    constructor(prisma, cryptoService) {
        this.prisma = prisma;
        this.cryptoService = cryptoService;
    }
    async getShopOverview(shopId) {
        this.logger.log(`Fetching overview for shopId: ${shopId}`);
        if (!shopId) {
            throw new common_1.BadRequestException('Shop ID is required');
        }
        const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            include: {
                subscription: true,
                whatsappAccounts: {
                    include: { phoneNumbers: true },
                },
            },
        });
        if (!shop)
            throw new common_1.NotFoundException('Shop not found');
        const messageCount = await this.prisma.message.count({ where: { shopId } });
        const contactCount = await this.prisma.contact.count({ where: { shopId } });
        const templateCount = await this.prisma.template.count({ where: { shopId } });
        return {
            shop,
            stats: {
                totalMessages: messageCount,
                totalContacts: contactCount,
                totalTemplates: templateCount,
            },
        };
    }
    async updateShopDetails(shopId, data) {
        if (!shopId) {
            throw new common_1.BadRequestException('Shop ID is required');
        }
        const { shopName, phone } = data;
        return this.prisma.shop.update({
            where: { id: shopId },
            data: { shopName, phone },
        });
    }
    async getWhatsAppCredentials(shopId) {
        if (!shopId) {
            this.logger.warn('getWhatsAppCredentials called without shopId');
            return null;
        }
        const account = await this.prisma.whatsAppBusinessAccount.findFirst({
            where: { shopId, status: 'active' },
            include: { phoneNumbers: true },
        });
        if (!account)
            return null;
        return {
            id: account.id,
            businessAccountId: account.businessAccountId,
            wabaId: account.wabaId,
            businessName: account.businessName,
            phoneNumberId: account.phoneNumbers.find(p => p.isDefault)?.phoneNumberId || account.phoneNumbers[0]?.phoneNumberId,
            status: account.status,
            tokenType: account.tokenType,
            tokenExpiry: account.tokenExpiry,
            onboardingSource: account.onboardingSource,
            phoneNumbers: account.phoneNumbers,
        };
    }
    async updateWhatsAppCredentials(shopId, data) {
        if (!shopId) {
            throw new common_1.BadRequestException('Shop ID is required');
        }
        const { businessAccountId, phoneNumberId, accessToken } = data;
        const encryptedToken = this.cryptoService.encrypt(accessToken);
        const account = await this.prisma.whatsAppBusinessAccount.upsert({
            where: {
                id: await this.getExistingAccountId(shopId) || 'new-record',
            },
            create: {
                shopId,
                businessAccountId,
                accessToken: encryptedToken,
                status: 'active',
                onboardingSource: 'manual',
            },
            update: {
                businessAccountId,
                accessToken: encryptedToken,
            },
        });
        if (phoneNumberId) {
            await this.prisma.whatsAppPhoneNumber.upsert({
                where: { phoneNumberId },
                create: {
                    shopId,
                    wabaAccountId: account.id,
                    phoneNumberId,
                    isDefault: true,
                    status: 'active',
                },
                update: {
                    wabaAccountId: account.id,
                    isDefault: true,
                    status: 'active',
                },
            });
        }
        return account;
    }
    async getExistingAccountId(shopId) {
        if (!shopId)
            return null;
        const existing = await this.prisma.whatsAppBusinessAccount.findFirst({
            where: { shopId },
        });
        return existing?.id || null;
    }
};
exports.ShopsService = ShopsService;
exports.ShopsService = ShopsService = ShopsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService])
], ShopsService);
//# sourceMappingURL=shops.service.js.map