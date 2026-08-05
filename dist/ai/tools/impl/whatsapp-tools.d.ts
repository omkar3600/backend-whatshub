import { PrismaService } from '../../../prisma/prisma.service';
import { WhatsappService } from '../../../whatsapp/whatsapp.service';
import { AiTool } from '../tool.interface';
export declare class WhatsAppTools {
    private readonly prisma;
    private readonly whatsapp;
    constructor(prisma: PrismaService, whatsapp: WhatsappService);
    private getContactPhone;
    getTools(): AiTool[];
}
