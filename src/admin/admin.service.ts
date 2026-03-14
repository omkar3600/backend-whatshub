import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async createShop(data: any) {
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

    async updateShop(shopId: string, data: any) {
        const { username, email, password, shopName, phone } = data;

        const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            include: { owner: true }
        });

        if (!shop) throw new NotFoundException('Shop not found');

        let passwordHash: string | undefined = undefined;
        if (password) {
            const salt = await bcrypt.genSalt();
            passwordHash = await bcrypt.hash(password, salt);
        }

        return this.prisma.$transaction(async (tx) => {
            // Update User
            await tx.user.update({
                where: { id: shop.ownerId },
                data: {
                    username: username || undefined,
                    email: email || undefined,
                    passwordHash: passwordHash
                }
            });

            // Update Shop
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

    async updateSubscription(shopId: string, data: any) {
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


    async toggleShopStatus(shopId: string, status: string) {
        return this.prisma.shop.update({
            where: { id: shopId },
            data: { status },
        });
    }

    async deleteShop(shopId: string) {
        // Delete ALL related data in correct FK order
        return this.prisma.$transaction(async (prisma) => {
            // 1. Messages (depends on conversation)
            await prisma.message.deleteMany({ where: { shopId } });
            // 2. Campaigns (depends on template)
            await prisma.campaign.deleteMany({ where: { shopId } });
            // 3. Templates
            await prisma.template.deleteMany({ where: { shopId } });
            // 4. Media files
            await prisma.mediaFile.deleteMany({ where: { shopId } });
            // 5. Automations
            await prisma.automation.deleteMany({ where: { shopId } });
            // 6. WhatsApp credentials
            await prisma.whatsAppCredential.deleteMany({ where: { shopId } });
            // 7. Conversations (depends on contact)
            await prisma.conversation.deleteMany({ where: { shopId } });
            // 8. Contacts
            await prisma.contact.deleteMany({ where: { shopId } });
            // 9. Subscription
            await prisma.subscription.deleteMany({ where: { shopId } });
            // 10. Shop
            const shop = await prisma.shop.delete({ where: { id: shopId } });
            // 11. User (owner)
            await prisma.user.delete({ where: { id: shop.ownerId } });
            return { message: 'Shop and all related data deleted completely' };
        });
    }

    async getRegistrationRequests() {
        return this.prisma.registrationInterest.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async approveRegistrationRequest(requestId: string) {
        const request = await this.prisma.registrationInterest.findUnique({
            where: { id: requestId }
        });

        if (!request) throw new NotFoundException('Registration request not found');
        if (request.status !== 'pending') throw new Error('Request already processed');

        return this.prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    username: request.username,
                    email: request.email,
                    passwordHash: request.password,
                    role: 'user',
                },
            });

            // 2. Create Shop
            const shop = await tx.shop.create({
                data: {
                    ownerId: user.id,
                    shopName: request.shopName,
                    phone: request.phone,
                },
            });

            // 3. Create Subscription
            await tx.subscription.create({
                data: {
                    shopId: shop.id,
                    startDate: new Date(),
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
                    status: 'active',
                },
            });

            // 4. Update Request Status
            await tx.registrationInterest.update({
                where: { id: requestId },
                data: { status: 'approved' }
            });

            return { message: 'User approved and created successfully', user, shop };
        });
    }

    async rejectRegistrationRequest(requestId: string) {
        const request = await this.prisma.registrationInterest.findUnique({
            where: { id: requestId }
        });

        if (!request) throw new NotFoundException('Registration request not found');

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
}
