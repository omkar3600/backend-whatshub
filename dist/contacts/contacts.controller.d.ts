import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, GetContactsQueryDto } from './dto/contacts.dto';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    createContact(user: any, body: CreateContactDto): Promise<{
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
    importContacts(user: any, file: Express.Multer.File): Promise<{
        imported: number;
        skipped: number;
        errors: string[];
    }>;
    importBulkContacts(user: any, body: {
        rows: any[];
    }): Promise<{
        imported: number;
        skipped: number;
        errors: string[];
    }>;
    getContacts(user: any, query: GetContactsQueryDto): Promise<{
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
    normalizeContacts(user: any): Promise<{
        updated: number;
        invalid: number;
        errors: number;
        total: number;
    }>;
    getContact(user: any, id: string): Promise<{
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
    updateContact(user: any, id: string, body: UpdateContactDto): Promise<{
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
    deleteBulkContacts(user: any, body: {
        ids: string[];
    }): Promise<import("@prisma/client").Prisma.BatchPayload>;
    deleteContact(user: any, id: string): Promise<{
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
