import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        username: string;
        email: string | null;
        id: string;
        role: string;
        createdAt: Date;
    }>;
    updateProfile(userId: string, data: {
        username?: string;
        email?: string;
    }): Promise<{
        username: string;
        email: string | null;
        id: string;
        role: string;
    }>;
    changePassword(userId: string, data: any): Promise<{
        message: string;
    }>;
}
