import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
export declare class MediaService {
    private prisma;
    private httpService;
    private readonly logger;
    private supabaseUrl;
    private supabaseKey;
    private bucketName;
    constructor(prisma: PrismaService, httpService: HttpService);
    uploadFile(shopId: string, file: Express.Multer.File): Promise<{
        id: string;
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
