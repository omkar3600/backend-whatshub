import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, data: {
        username?: string;
        email?: string;
    }): Promise<any>;
    changePassword(userId: string, data: any): Promise<{
        message: string;
    }>;
}
