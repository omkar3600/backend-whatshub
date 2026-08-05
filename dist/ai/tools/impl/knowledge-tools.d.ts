import { PrismaService } from '../../../prisma/prisma.service';
import { AiTool } from '../tool.interface';
export declare class KnowledgeTools {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTools(): AiTool[];
}
