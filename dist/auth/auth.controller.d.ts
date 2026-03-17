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
    login(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            role: any;
            shopId: any;
        };
    }>;
}
