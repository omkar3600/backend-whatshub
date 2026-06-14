import { PrismaService } from '../prisma/prisma.service';
export declare class MediaService {
    private prisma;
    private readonly logger;
    private s3;
    private bucketName;
    private publicUrl;
    constructor(prisma: PrismaService);
    uploadFile(shopId: string, file: Express.Multer.File): Promise<{
        id: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        fileName: string | null;
    }>;
    getMediaFiles(shopId: string): Promise<{
        id: string;
        createdAt: Date;
        shopId: string;
        fileName: string | null;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }[]>;
    deleteMediaFile(shopId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        shopId: string;
        fileName: string | null;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }>;
    deleteAllMediaFiles(shopId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
