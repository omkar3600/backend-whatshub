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
const bcrypt = __importStar(require("bcryptjs"));
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createShop(data) {
        const { username, email, password, shopName, phone, ownerName, expiryDate } = data;
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await this.prisma.user.create({
            data: {
                username: username || email.split('@')[0],
                email,
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
                owner: { select: { email: true, id: true, username: true } },
                subscription: true,
            },
        });
    }
    async updateShop(shopId, data) {
        const { username, email, password, shopName, phone } = data;
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
                    email: email || undefined,
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
                    owner: { select: { email: true, id: true, username: true } },
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
            await prisma.message.deleteMany({ where: { shopId } });
            await prisma.campaign.deleteMany({ where: { shopId } });
            await prisma.template.deleteMany({ where: { shopId } });
            await prisma.mediaFile.deleteMany({ where: { shopId } });
            await prisma.automation.deleteMany({ where: { shopId } });
            await prisma.whatsAppCredential.deleteMany({ where: { shopId } });
            await prisma.conversation.deleteMany({ where: { shopId } });
            await prisma.contact.deleteMany({ where: { shopId } });
            await prisma.subscription.deleteMany({ where: { shopId } });
            const shop = await prisma.shop.delete({ where: { id: shopId } });
            await prisma.user.delete({ where: { id: shop.ownerId } });
            return { message: 'Shop and all related data deleted completely' };
        });
    }
    async getRegistrationRequests() {
        return this.prisma.registrationInterest.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async approveRegistrationRequest(requestId) {
        const request = await this.prisma.registrationInterest.findUnique({
            where: { id: requestId }
        });
        if (!request)
            throw new common_1.NotFoundException('Registration request not found');
        if (request.status !== 'pending')
            throw new Error('Request already processed');
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username: request.username,
                    email: request.email,
                    passwordHash: request.password,
                    role: 'user',
                },
            });
            const shop = await tx.shop.create({
                data: {
                    ownerId: user.id,
                    shopName: request.shopName,
                    phone: request.phone,
                },
            });
            await tx.subscription.create({
                data: {
                    shopId: shop.id,
                    startDate: new Date(),
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    status: 'active',
                },
            });
            await tx.registrationInterest.update({
                where: { id: requestId },
                data: { status: 'approved' }
            });
            return { message: 'User approved and created successfully', user, shop };
        });
    }
    async rejectRegistrationRequest(requestId) {
        const request = await this.prisma.registrationInterest.findUnique({
            where: { id: requestId }
        });
        if (!request)
            throw new common_1.NotFoundException('Registration request not found');
        return this.prisma.registrationInterest.update({
            where: { id: requestId },
            data: { status: 'rejected' }
        });
    }
    async getStats() {
        const [totalShops, activeShops, disabledShops, expiredSubscriptions] = await Promise.all([
            this.prisma.shop.count(),
            this.prisma.shop.count({ where: { status: 'active' } }),
            this.prisma.shop.count({ where: { status: 'disabled' } }),
            this.prisma.subscription.count({
                where: {
                    expiryDate: { lt: new Date() },
                    status: 'active'
                }
            })
        ]);
        return {
            totalShops,
            activeShops,
            disabledShops,
            expiredSubscriptions
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map