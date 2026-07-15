import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    submitDemoRequest(body: any): Promise<{
        message: string;
    }>;
    login(body: LoginDto, res: Response): Promise<{
        user: {
            id: string;
            username: string;
            role: string;
            shopId: string | undefined;
            shop: {
                id: string;
                shopName: string;
                phone: string;
            } | null;
        };
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
}
