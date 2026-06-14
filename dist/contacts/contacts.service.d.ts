import { PrismaService } from '../prisma/prisma.service';
import { SequencesService } from '../sequences/sequences.service';
export declare class ContactsService {
    private prisma;
    private sequencesService;
    private readonly logger;
    constructor(prisma: PrismaService, sequencesService: SequencesService);
    createContact(shopId: string, data: any): Promise<any>;
    importFromExcel(shopId: string, file: Express.Multer.File): Promise<{
        imported: number;
        skipped: number;
        errors: string[];
    }>;
    getContacts(shopId: string, filters: any): Promise<any>;
    getContact(shopId: string, id: string): Promise<any>;
    updateContact(shopId: string, id: string, data: any): Promise<any>;
    deleteContact(shopId: string, id: string): Promise<any>;
}
