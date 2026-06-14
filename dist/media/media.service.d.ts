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
    getMediaFiles(shopId: string): Promise<any>;
    deleteMediaFile(shopId: string, id: string): Promise<any>;
    deleteAllMediaFiles(shopId: string): Promise<any>;
}
