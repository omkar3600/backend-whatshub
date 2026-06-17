import { PrismaService } from '../prisma/prisma.service';
import { SequencesService } from '../sequences/sequences.service';
export declare class ContactsService {
    private prisma;
    private sequencesService;
    private readonly logger;
    constructor(prisma: PrismaService, sequencesService: SequencesService);
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
}
