import { PrismaService } from '../prisma/prisma.service';
export declare class ContactsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createContact(shopId: string, data: any): Promise<{
        name: string;
        phone: string;
        city: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }>;
    importFromExcel(shopId: string, file: Express.Multer.File): Promise<{
        imported: number;
        skipped: number;
        errors: string[];
    }>;
    importBulk(shopId: string, rows: any[]): Promise<{
        imported: number;
        skipped: number;
        errors: string[];
    }>;
    getContacts(shopId: string, filters: any): Promise<{
        name: string;
        phone: string;
        city: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }[] | {
        data: {
            name: string;
            phone: string;
            city: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shopId: string;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getContact(shopId: string, id: string): Promise<{
        name: string;
        phone: string;
        city: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }>;
    updateContact(shopId: string, id: string, data: any): Promise<{
        name: string;
        phone: string;
        city: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }>;
    deleteContact(shopId: string, id: string): Promise<{
        name: string;
        phone: string;
        city: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }>;
    deleteBulk(shopId: string, ids: string[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    normalizeContacts(shopId: string): Promise<{
        updated: number;
        invalid: number;
        errors: number;
        total: number;
    }>;
}
