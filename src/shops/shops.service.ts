import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopsService {
    private readonly logger = new Logger(ShopsService.name);
    constructor(private prisma: PrismaService) { }

    async getShopOverview(shopId: string) {
        this.logger.log(`Fetching overview for shopId: ${shopId}`);
        const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            include: { subscription: true, whatsappCreds: true },
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
        return this.prisma.whatsAppCredential.findUnique({
            where: { shopId },
        });
    }

    async updateWhatsAppCredentials(shopId: string, data: any) {
        const { businessAccountId, phoneNumberId, accessToken } = data;
        return this.prisma.whatsAppCredential.upsert({
            where: { shopId },
            create: {
                shopId,
                businessAccountId,
                phoneNumberId,
                accessToken,
            },
            update: {
                businessAccountId,
                phoneNumberId,
                accessToken,
            },
        });
    }
}
