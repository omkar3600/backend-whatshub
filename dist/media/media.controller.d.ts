import { MediaService } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    uploadFile(user: any, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        shopId: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }>;
    getMediaFiles(user: any): Promise<{
        id: string;
        createdAt: Date;
        shopId: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }[]>;
}
