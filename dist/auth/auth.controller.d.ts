import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterInterestDto, RegisterShopDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    registerInterest(body: RegisterInterestDto): Promise<{
        message: string;
    }>;
    register(body: RegisterShopDto): Promise<{
        message: string;
        shopId: string;
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
