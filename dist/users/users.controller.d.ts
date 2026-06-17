import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: any, res: any): Promise<{
        shop: {
            subscription: {
                status: string;
                expiryDate: Date;
            } | null;
            phone: string;
            id: string;
            status: string;
            shopName: string;
        } | null;
        id: string;
        createdAt: Date;
        username: string;
        role: string;
    }>;
    updateProfile(user: any, body: any): Promise<{
        id: string;
        username: string;
        role: string;
    }>;
    changePassword(user: any, body: any): Promise<{
        message: string;
    }>;
}
