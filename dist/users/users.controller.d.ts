import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<{
        username: string;
        email: string | null;
        id: string;
        role: string;
        createdAt: Date;
    }>;
    updateProfile(user: any, body: any): Promise<{
        username: string;
        email: string | null;
        id: string;
        role: string;
    }>;
    changePassword(user: any, body: any): Promise<{
        message: string;
    }>;
}
