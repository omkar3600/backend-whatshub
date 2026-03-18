import { PrismaService } from '../prisma/prisma.service';
export declare class MediaService {
    private prisma;
    private readonly logger;
    private s3;
    constructor(prisma: PrismaService);
    uploadFile(shopId: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        shopId: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }>;
    getMediaFiles(shopId: string): Promise<{
        id: string;
        createdAt: Date;
        shopId: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }[]>;
}
