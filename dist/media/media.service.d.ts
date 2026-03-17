import { PrismaService } from '../prisma/prisma.service';
export declare class MediaService {
    private prisma;
    private readonly logger;
    private s3;
    constructor(prisma: PrismaService);
    uploadFile(shopId: string, file: Express.Multer.File): Promise<any>;
    getMediaFiles(shopId: string): Promise<any>;
}
