import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../common/services/crypto.service';

@Injectable()
export class ShopsService {
    private readonly logger = new Logger(ShopsService.name);
    constructor(
        private prisma: PrismaService,
        private cryptoService: CryptoService,
    ) { }

    async getShopOverview(shopId: string) {
        this.logger.log(`Fetching overview for shopId: ${shopId}`);
        const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            include: {
                subscription: true,
                whatsappAccounts: {
                    include: { phoneNumbers: true },
                },
            },
        });

        if (!shop) throw new NotFoundException('Shop not found');

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

    async updateShopDetails(shopId: string, data: any) {
        const { shopName, phone } = data;
        return this.prisma.shop.update({
            where: { id: shopId },
            data: { shopName, phone },
        });
    }

    async getWhatsAppCredentials(shopId: string) {
        // Return from the new multi-tenant model
        const account = await this.prisma.whatsAppBusinessAccount.findFirst({
            where: { shopId, status: 'active' },
            include: { phoneNumbers: true },
        });

        if (!account) return null;

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

    async updateWhatsAppCredentials(shopId: string, data: any) {
        const { businessAccountId, phoneNumberId, accessToken } = data;

        // Encrypt the token before storing
        const encryptedToken = this.cryptoService.encrypt(accessToken);

        // Upsert into the new model
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

        // Upsert the phone number
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
                    isDefault: true,
                    status: 'active',
                },
            });
        }

        return account;
    }

    private async getExistingAccountId(shopId: string): Promise<string | null> {
        const existing = await this.prisma.whatsAppBusinessAccount.findFirst({
            where: { shopId },
        });
        return existing?.id || null;
    }
}
