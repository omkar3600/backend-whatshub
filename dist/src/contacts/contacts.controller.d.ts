import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, GetContactsQueryDto } from './dto/contacts.dto';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    createContact(user: any, body: CreateContactDto): Promise<{
        id: string;
        shopId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        city: string | null;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }>;
    importContacts(user: any, file: Express.Multer.File): Promise<{
        imported: number;
        skipped: number;
        errors: string[];
    }>;
    getContacts(user: any, query: GetContactsQueryDto): Promise<{
        id: string;
        shopId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        city: string | null;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }[] | {
        data: {
            id: string;
            shopId: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            city: string | null;
            tags: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getContact(user: any, id: string): Promise<{
        id: string;
        shopId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        city: string | null;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }>;
    updateContact(user: any, id: string, body: UpdateContactDto): Promise<{
        id: string;
        shopId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        city: string | null;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }>;
    deleteContact(user: any, id: string): Promise<{
        id: string;
        shopId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        city: string | null;
        tags: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }>;
}
