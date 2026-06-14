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
    getMediaFiles(user: any): Promise<any>;
    deleteMediaFile(user: any, id: string): Promise<any>;
}
