import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, data: any): Promise<any>;
    uploadPicture(req: any, file: Express.Multer.File): Promise<any>;
    updateName(req: any, newName: string): Promise<any>;
    registerNumber(req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
