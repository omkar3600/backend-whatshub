import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { ContactsService } from '../contacts/contacts.service';
import { MediaService } from '../media/media.service';
export declare class IntegrationService {
    private readonly prisma;
    private readonly messagesService;
    private readonly contactsService;
    private readonly mediaService;
    constructor(prisma: PrismaService, messagesService: MessagesService, contactsService: ContactsService, mediaService: MediaService);
    private getOrCreateConversation;
    sendMessage(shopId: string, phone: string, text: string): Promise<{
        success: boolean;
        messageId: string;
        status: string;
    }>;
    sendMediaMessage(shopId: string, phone: string, file: Express.Multer.File, caption?: string): Promise<{
        success: boolean;
        messageId: string;
        status: string;
        mediaUrl: string;
    }>;
    syncContact(shopId: string, data: {
        name: string;
        phone: string;
        email?: string;
    }): Promise<{
        success: boolean;
        contactId: string;
    }>;
}
