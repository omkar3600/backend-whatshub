import { MediaService } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    uploadFile(user: any, file: Express.Multer.File): Promise<{
        id: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        fileName: string | null;
    }>;
    getMediaFiles(user: any): Promise<{
        id: string;
        createdAt: Date;
        shopId: string;
        fileName: string | null;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }[]>;
    deleteMediaFile(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        shopId: string;
        fileName: string | null;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }>;
}
