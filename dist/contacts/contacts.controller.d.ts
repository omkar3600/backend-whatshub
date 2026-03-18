import { ContactsService } from './contacts.service';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    createContact(user: any, body: any): Promise<{
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
    getContacts(user: any, query: any): Promise<{
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
    getContact(user: any, id: string): Promise<{
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
    updateContact(user: any, id: string, body: any): Promise<{
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
    deleteContact(user: any, id: string): Promise<{
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
