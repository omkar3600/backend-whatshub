import { PrismaService } from '../prisma/prisma.service';
export declare class ContactsService {
    private prisma;
    constructor(prisma: PrismaService);
    createContact(shopId: string, data: any): Promise<any>;
    getContacts(shopId: string, filters: any): Promise<any>;
    getContact(shopId: string, id: string): Promise<any>;
    updateContact(shopId: string, id: string, data: any): Promise<any>;
    deleteContact(shopId: string, id: string): Promise<any>;
}
