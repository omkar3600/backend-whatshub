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
    login(body: any): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            email: string | null;
            role: string;
            shopId: string | undefined;
        };
    }>;
}
