import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
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
