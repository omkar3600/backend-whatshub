import { PrismaService } from '../prisma/prisma.service';
export declare class ContactsService {
    private prisma;
    constructor(prisma: PrismaService);
    createContact(shopId: string, data: any): Promise<{
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shopId: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        city: string | null;
        notes: string | null;
    }>;
    getContacts(shopId: string, filters: any): Promise<{
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shopId: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        city: string | null;
        notes: string | null;
    }[]>;
    getContact(shopId: string, id: string): Promise<{
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shopId: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        city: string | null;
        notes: string | null;
    }>;
    updateContact(shopId: string, id: string, data: any): Promise<{
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shopId: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        city: string | null;
        notes: string | null;
    }>;
    deleteContact(shopId: string, id: string): Promise<{
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shopId: string;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        city: string | null;
        notes: string | null;
    }>;
}
