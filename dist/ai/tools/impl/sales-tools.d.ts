import { PrismaService } from '../../../prisma/prisma.service';
import { AiTool } from '../tool.interface';
export declare class SalesTools {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTools(): AiTool[];
}
