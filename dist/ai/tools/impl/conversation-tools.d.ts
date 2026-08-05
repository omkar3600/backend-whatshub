import { PrismaService } from '../../../prisma/prisma.service';
import { AiTool } from '../tool.interface';
export declare class ConversationTools {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTools(): AiTool[];
}
