import { PrismaService } from '../../../prisma/prisma.service';
import { AiTool } from '../tool.interface';
export declare class ContactTools {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTools(): AiTool[];
}
