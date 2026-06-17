import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
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
    updateProfile(userId: string, data: {
        username?: string;
    }): Promise<{
        id: string;
        username: string;
        role: string;
    }>;
    changePassword(userId: string, data: any): Promise<{
        message: string;
    }>;
}
