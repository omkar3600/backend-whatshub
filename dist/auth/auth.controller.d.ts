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
        shopId: string;
    }>;
    login(body: any, res: Response): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            email: string | null;
            role: string;
            shopId: string | undefined;
        };
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
}
