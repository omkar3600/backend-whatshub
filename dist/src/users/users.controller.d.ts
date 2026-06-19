import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: any, res: any): Promise<{
        id: string;
        createdAt: Date;
        shop: {
            id: string;
            status: string;
            subscription: {
                status: string;
                expiryDate: Date;
            } | null;
            phone: string;
            shopName: string;
        } | null;
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
