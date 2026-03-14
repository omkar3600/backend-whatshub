import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
    constructor(private prisma: PrismaService) { }

    async createContact(shopId: string, data: any) {
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

    async getContacts(shopId: string, filters: any) {
        // Basic filter by tags or search
        return this.prisma.contact.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getContact(shopId: string, id: string) {
        const contact = await this.prisma.contact.findFirst({
            where: { id, shopId },
        });
        if (!contact) throw new NotFoundException('Contact not found');
        return contact;
    }

    async updateContact(shopId: string, id: string, data: any) {
        const { name, phone, tags, city, notes } = data;
        return this.prisma.contact.update({
            where: { id, shopId },
            data: { name, phone, tags, city, notes },
        });
    }

    async deleteContact(shopId: string, id: string) {
        return this.prisma.contact.delete({
            where: { id, shopId },
        });
    }
}
