import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';

@Injectable()
export class ContactsService {
    private readonly logger = new Logger(ContactsService.name);

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

    async importFromExcel(shopId: string, file: Express.Multer.File): Promise<{ imported: number; skipped: number; errors: string[] }> {
        const ext = file.originalname.toLowerCase();
        if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls') && !ext.endsWith('.csv')) {
            throw new BadRequestException('Only .xlsx, .xls, and .csv files are supported');
        }

        let rows: any[];
        try {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        } catch (err) {
            this.logger.error('Failed to parse Excel file', err);
            throw new BadRequestException('Could not parse the uploaded file. Please check the format.');
        }

        if (!rows.length) {
            throw new BadRequestException('The file is empty or has no data rows.');
        }

        // Normalize column names — accept various header formats
        const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const headerMap: Record<string, string> = {};
        const rawHeaders = Object.keys(rows[0]);
        for (const h of rawHeaders) {
            const norm = normalizeKey(h);
            if (['phone', 'phonenumber', 'mobile', 'mobilenumber', 'whatsapp', 'whatsappnumber', 'number', 'contact'].includes(norm)) {
                headerMap[h] = 'phone';
            } else if (['name', 'fullname', 'contactname', 'customername'].includes(norm)) {
                headerMap[h] = 'name';
            } else if (['tags', 'tag', 'label', 'labels', 'group', 'groups'].includes(norm)) {
                headerMap[h] = 'tags';
            } else if (['city', 'location', 'area'].includes(norm)) {
                headerMap[h] = 'city';
            } else if (['notes', 'note', 'comment', 'comments', 'description'].includes(norm)) {
                headerMap[h] = 'notes';
            }
        }

        // Ensure phone column exists
        if (!Object.values(headerMap).includes('phone')) {
            throw new BadRequestException(
                `Could not find a "Phone" column. Found columns: ${rawHeaders.join(', ')}. ` +
                `Expected: phone, name, tags, city, notes`
            );
        }

        let imported = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const mapped: Record<string, any> = {};
            for (const [rawKey, mappedKey] of Object.entries(headerMap)) {
                mapped[mappedKey] = row[rawKey];
            }

            // Clean phone number
            let phone = String(mapped.phone || '').replace(/[\s\-\(\)\+\.]/g, '').trim();
            if (!phone || phone.length < 7) {
                skipped++;
                if (phone) errors.push(`Row ${i + 2}: Invalid phone "${phone}"`);
                continue;
            }

            // Auto-prefix with 91 if phone starts without country code (10 digits)
            if (phone.length === 10 && /^\d+$/.test(phone)) {
                phone = '91' + phone;
            }

            const name = String(mapped.name || '').trim() || 'Unknown';
            const city = mapped.city ? String(mapped.city).trim() : undefined;
            const notes = mapped.notes ? String(mapped.notes).trim() : undefined;
            let tags: string[] = [];
            if (mapped.tags) {
                tags = String(mapped.tags).split(',').map(t => t.trim()).filter(Boolean);
            }

            try {
                await this.prisma.contact.upsert({
                    where: { shopId_phone: { shopId, phone } },
                    create: { shopId, name, phone, tags, city, notes },
                    update: {
                        // Only update non-empty values — don't overwrite existing data with blanks
                        ...(name !== 'Unknown' ? { name } : {}),
                        ...(tags.length > 0 ? { tags } : {}),
                        ...(city ? { city } : {}),
                        ...(notes ? { notes } : {}),
                    },
                });
                imported++;
            } catch (err: any) {
                skipped++;
                errors.push(`Row ${i + 2}: ${err?.message?.substring(0, 80) || 'Database error'}`);
            }
        }

        this.logger.log(`[Import] shopId=${shopId}: imported=${imported}, skipped=${skipped}`);
        return { imported, skipped, errors: errors.slice(0, 20) }; // Max 20 error messages
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
