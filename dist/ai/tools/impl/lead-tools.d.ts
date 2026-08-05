import { PrismaService } from '../../../prisma/prisma.service';
import { AiTool } from '../tool.interface';
export declare class LeadTools {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTools(): AiTool[];
}
