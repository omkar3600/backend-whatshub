"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_service_1 = require("../common/services/crypto.service");
const bcrypt = __importStar(require("bcryptjs"));
let AdminService = class AdminService {
    prisma;
    cryptoService;
    constructor(prisma, cryptoService) {
        this.prisma = prisma;
        this.cryptoService = cryptoService;
    }
    async createShop(data) {
        const { username, password, shopName, phone, ownerName, expiryDate } = data;
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await this.prisma.user.create({
            data: {
                username,
                passwordHash,
                role: 'user',
            },
        });
        const shop = await this.prisma.shop.create({
            data: {
                ownerId: user.id,
                shopName,
                phone,
            },
        });
        const subscription = await this.prisma.subscription.create({
            data: {
                shopId: shop.id,
                startDate: new Date(),
                expiryDate: new Date(expiryDate),
                status: 'active',
            },
        });
        return { message: 'Shop and subscription created successfully', shop, subscription };
    }
    async getShops() {
        return this.prisma.shop.findMany({
            include: {
                owner: { select: { id: true, username: true } },
                subscription: true,
                whatsappAccounts: {
                    include: { phoneNumbers: true },
                },
            },
        });
    }
    async updateShop(shopId, data) {
        const { username, password, shopName, phone } = data;
        const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            include: { owner: true }
        });
        if (!shop)
            throw new common_1.NotFoundException('Shop not found');
        let passwordHash = undefined;
        if (password) {
            const salt = await bcrypt.genSalt();
            passwordHash = await bcrypt.hash(password, salt);
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: shop.ownerId },
                data: {
                    username: username || undefined,
                    passwordHash: passwordHash
                }
            });
            return tx.shop.update({
                where: { id: shopId },
                data: {
                    shopName: shopName || undefined,
                    phone: phone || undefined,
                },
                include: {
                    owner: { select: { id: true, username: true } },
                    subscription: true
                }
            });
        });
    }
    async updateSubscription(shopId, data) {
        const { expiryDate, status } = data;
        const expiry = expiryDate ? new Date(expiryDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return this.prisma.subscription.upsert({
            where: { shopId },
            create: {
                shopId,
                startDate: new Date(),
                expiryDate: expiry,
                status: status || 'active',
            },
            update: {
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                status: status,
            },
        });
    }
    async toggleShopStatus(shopId, status) {
        return this.prisma.shop.update({
            where: { id: shopId },
            data: { status },
        });
    }
    async deleteShop(shopId) {
        return this.prisma.$transaction(async (prisma) => {
            await prisma.chatbotConfig.deleteMany({ where: { shopId } });
            await prisma.flow.deleteMany({ where: { shopId } });
            await prisma.sequence.deleteMany({ where: { shopId } });
            await prisma.campaign.deleteMany({ where: { shopId } });
            await prisma.template.deleteMany({ where: { shopId } });
            await prisma.message.deleteMany({ where: { shopId } });
            await prisma.conversation.deleteMany({ where: { shopId } });
            await prisma.contact.deleteMany({ where: { shopId } });
            await prisma.mediaFile.deleteMany({ where: { shopId } });
            await prisma.automation.deleteMany({ where: { shopId } });
            await prisma.onboardingEvent.deleteMany({ where: { shopId } });
            await prisma.whatsAppPhoneNumber.deleteMany({ where: { shopId } });
            await prisma.whatsAppBusinessAccount.deleteMany({ where: { shopId } });
            await prisma.subscription.deleteMany({ where: { shopId } });
            const shop = await prisma.shop.delete({ where: { id: shopId } });
            await prisma.user.delete({ where: { id: shop.ownerId } });
            return { message: 'Shop and all related data deleted completely' };
        });
    }
    async getDemoRequests() {
        return this.prisma.demoRequest.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async resolveDemoRequest(requestId) {
        const request = await this.prisma.demoRequest.findUnique({
            where: { id: requestId }
        });
        if (!request)
            throw new common_1.NotFoundException('Demo request not found');
        if (request.status !== 'pending')
            throw new Error('Request already processed');
        await this.prisma.demoRequest.update({
            where: { id: requestId },
            data: { status: 'resolved' }
        });
        return { message: 'Demo request marked as resolved.' };
    }
    async rejectDemoRequest(requestId) {
        const request = await this.prisma.demoRequest.findUnique({
            where: { id: requestId }
        });
        if (!request)
            throw new common_1.NotFoundException('Demo request not found');
        return this.prisma.demoRequest.update({
            where: { id: requestId },
            data: { status: 'rejected' }
        });
    }
    async getStats() {
        const [totalShops, activeShops, disabledShops, expiredSubscriptions, connectedWabas, totalPhoneNumbers] = await Promise.all([
            this.prisma.shop.count(),
            this.prisma.shop.count({ where: { status: 'active' } }),
            this.prisma.shop.count({ where: { status: 'disabled' } }),
            this.prisma.subscription.count({
                where: {
                    expiryDate: { lt: new Date() },
                    status: 'active'
                }
            }),
            this.prisma.whatsAppBusinessAccount.count({ where: { status: 'active' } }),
            this.prisma.whatsAppPhoneNumber.count({ where: { status: 'active' } }),
        ]);
        return {
            totalShops,
            activeShops,
            disabledShops,
            expiredSubscriptions,
            connectedWabas,
            totalPhoneNumbers,
        };
    }
    async getTenantConnections() {
        const shops = await this.prisma.shop.findMany({
            include: {
                owner: { select: { id: true, username: true } },
                subscription: true,
                whatsappAccounts: {
                    include: { phoneNumbers: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return shops.map(shop => {
            const accounts = shop.whatsappAccounts.map(account => {
                let tokenHealth = 'valid';
                if (account.tokenExpiry) {
                    const daysLeft = (account.tokenExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                    if (daysLeft <= 0)
                        tokenHealth = 'expired';
                    else if (daysLeft <= 7)
                        tokenHealth = 'expiring_soon';
                }
                return {
                    id: account.id,
                    wabaId: account.wabaId || account.businessAccountId,
                    businessName: account.businessName,
                    status: account.status,
                    tokenHealth,
                    tokenExpiry: account.tokenExpiry,
                    onboardingSource: account.onboardingSource,
                    phoneNumbers: account.phoneNumbers.map(pn => ({
                        phoneNumberId: pn.phoneNumberId,
                        displayPhoneNumber: pn.displayPhoneNumber,
                        verifiedName: pn.verifiedName,
                        qualityRating: pn.qualityRating,
                        messagingLimit: pn.messagingLimit,
                        status: pn.status,
                    })),
                };
            });
            return {
                shopId: shop.id,
                shopName: shop.shopName,
                owner: shop.owner,
                status: shop.status,
                subscription: shop.subscription,
                isConnected: accounts.some(a => a.status === 'active'),
                accounts,
            };
        });
    }
    async getWebhookFailures(shopId) {
        const where = { processingStatus: { in: ['failed', 'dead_letter'] } };
        if (shopId)
            where.shopId = shopId;
        return this.prisma.webhookAuditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async getDeadLetterEvents(status) {
        const where = {};
        if (status)
            where.status = status;
        return this.prisma.deadLetterEvent.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async getTokenHealth() {
        const accounts = await this.prisma.whatsAppBusinessAccount.findMany({
            where: { status: { in: ['active', 'token_expired'] } },
            include: {
                shop: { select: { shopName: true } },
            },
        });
        return accounts.map(account => {
            let tokenHealth = 'valid';
            if (account.tokenExpiry) {
                const daysLeft = (account.tokenExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                if (daysLeft <= 0)
                    tokenHealth = 'expired';
                else if (daysLeft <= 7)
                    tokenHealth = 'expiring_soon';
            }
            return {
                shopName: account.shop.shopName,
                wabaId: account.wabaId || account.businessAccountId,
                businessName: account.businessName,
                status: account.status,
                tokenHealth,
                tokenExpiry: account.tokenExpiry,
            };
        });
    }
    async suspendShop(shopId) {
        await this.prisma.whatsAppBusinessAccount.updateMany({
            where: { shopId },
            data: { status: 'suspended' },
        });
        await this.prisma.whatsAppPhoneNumber.updateMany({
            where: { shopId },
            data: { status: 'inactive' },
        });
        return { message: 'Shop WhatsApp access suspended' };
    }
    async getOnboardingStatus(shopId) {
        const events = await this.prisma.onboardingEvent.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
        });
        const latestEvent = events[0];
        let status = 'not_started';
        if (latestEvent) {
            if (latestEvent.eventType === 'completed')
                status = 'connected';
            else if (latestEvent.eventType === 'failed')
                status = 'failed';
            else if (latestEvent.eventType === 'disconnected')
                status = 'disconnected';
            else
                status = 'in_progress';
        }
        return { status, events };
    }
    async setWhatsAppCredentials(shopId, data) {
        const { businessAccountId, phoneNumberId, accessToken } = data;
        const encryptedToken = this.cryptoService.encrypt(accessToken);
        const account = await this.prisma.whatsAppBusinessAccount.create({
            data: {
                shopId,
                businessAccountId,
                accessToken: encryptedToken,
                status: 'active',
                onboardingSource: 'manual',
            },
        });
        if (phoneNumberId) {
            await this.prisma.whatsAppPhoneNumber.create({
                data: {
                    shopId,
                    wabaAccountId: account.id,
                    phoneNumberId,
                    isDefault: true,
                    status: 'active',
                },
            });
        }
        return { message: 'WhatsApp credentials set successfully', account };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService])
], AdminService);
//# sourceMappingURL=admin.service.js.map