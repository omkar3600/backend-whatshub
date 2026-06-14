import type { Response } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    registerInterest(body: any): Promise<{
        message: string;
    }>;
    register(body: any): Promise<{
        message: string;
        shopId: any;
    }>;
    login(body: any, res: Response): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            role: any;
            shopId: any;
            shop: {
                id: any;
                shopName: any;
                phone: any;
            } | null;
        };
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
}
