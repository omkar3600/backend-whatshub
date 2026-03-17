import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<any>;
    updateProfile(user: any, body: any): Promise<any>;
    changePassword(user: any, body: any): Promise<{
        message: string;
    }>;
}
