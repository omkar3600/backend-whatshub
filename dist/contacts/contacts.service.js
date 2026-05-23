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
var ContactsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sequences_service_1 = require("../sequences/sequences.service");
const XLSX = __importStar(require("xlsx"));
let ContactsService = ContactsService_1 = class ContactsService {
    prisma;
    sequencesService;
    logger = new common_1.Logger(ContactsService_1.name);
    constructor(prisma, sequencesService) {
        this.prisma = prisma;
        this.sequencesService = sequencesService;
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
    async importFromExcel(shopId, file) {
        const ext = file.originalname.toLowerCase();
        if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls') && !ext.endsWith('.csv')) {
            throw new common_1.BadRequestException('Only .xlsx, .xls, and .csv files are supported');
        }
        let rows;
        try {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        }
        catch (err) {
            this.logger.error('Failed to parse Excel file', err);
            throw new common_1.BadRequestException('Could not parse the uploaded file. Please check the format.');
        }
        if (!rows.length) {
            throw new common_1.BadRequestException('The file is empty or has no data rows.');
        }
        const normalizeKey = (key) => key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const headerMap = {};
        const rawHeaders = Object.keys(rows[0]);
        for (const h of rawHeaders) {
            const norm = normalizeKey(h);
            if (['phone', 'phonenumber', 'mobile', 'mobilenumber', 'whatsapp', 'whatsappnumber', 'number', 'contact'].includes(norm)) {
                headerMap[h] = 'phone';
            }
            else if (['name', 'fullname', 'contactname', 'customername'].includes(norm)) {
                headerMap[h] = 'name';
            }
            else if (['tags', 'tag', 'label', 'labels', 'group', 'groups'].includes(norm)) {
                headerMap[h] = 'tags';
            }
            else if (['city', 'location', 'area'].includes(norm)) {
                headerMap[h] = 'city';
            }
            else if (['notes', 'note', 'comment', 'comments', 'description'].includes(norm)) {
                headerMap[h] = 'notes';
            }
        }
        if (!Object.values(headerMap).includes('phone')) {
            throw new common_1.BadRequestException(`Could not find a "Phone" column. Found columns: ${rawHeaders.join(', ')}. ` +
                `Expected: phone, name, tags, city, notes`);
        }
        let imported = 0;
        let skipped = 0;
        const errors = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const mapped = {};
            for (const [rawKey, mappedKey] of Object.entries(headerMap)) {
                mapped[mappedKey] = row[rawKey];
            }
            let phone = String(mapped.phone || '').replace(/[\s\-\(\)\+\.]/g, '').trim();
            if (!phone || phone.length < 7) {
                skipped++;
                if (phone)
                    errors.push(`Row ${i + 2}: Invalid phone "${phone}"`);
                continue;
            }
            if (phone.length === 10 && /^\d+$/.test(phone)) {
                phone = '91' + phone;
            }
            const name = String(mapped.name || '').trim() || 'Unknown';
            const city = mapped.city ? String(mapped.city).trim() : undefined;
            const notes = mapped.notes ? String(mapped.notes).trim() : undefined;
            let tags = [];
            if (mapped.tags) {
                tags = String(mapped.tags).split(',').map(t => t.trim()).filter(Boolean);
            }
            try {
                const contact = await this.prisma.contact.upsert({
                    where: { shopId_phone: { shopId, phone } },
                    create: { shopId, name, phone, tags, city, notes },
                    update: {
                        ...(name !== 'Unknown' ? { name } : {}),
                        ...(tags.length > 0 ? { tags } : {}),
                        ...(city ? { city } : {}),
                        ...(notes ? { notes } : {}),
                    },
                });
                if (tags.length > 0) {
                    await this.sequencesService.handleContactTagsUpdated(shopId, contact.id, tags);
                }
                imported++;
            }
            catch (err) {
                skipped++;
                errors.push(`Row ${i + 2}: ${err?.message?.substring(0, 80) || 'Database error'}`);
            }
        }
        this.logger.log(`[Import] shopId=${shopId}: imported=${imported}, skipped=${skipped}`);
        return { imported, skipped, errors: errors.slice(0, 20) };
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
        const contact = await this.prisma.contact.update({
            where: { id, shopId },
            data: { name, phone, tags, city, notes },
        });
        if (tags && tags.length > 0) {
            await this.sequencesService.handleContactTagsUpdated(shopId, id, tags);
        }
        return contact;
    }
    async deleteContact(shopId, id) {
        return this.prisma.contact.delete({
            where: { id, shopId },
        });
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = ContactsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sequences_service_1.SequencesService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map