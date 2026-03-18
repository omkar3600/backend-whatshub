import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    createShop(data: any): Promise<{
        message: string;
        shop: {
            shopName: string;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            ownerId: string;
        };
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            expiryDate: Date;
            startDate: Date;
            shopId: string;
        };
    }>;
    getShops(): Promise<({
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            expiryDate: Date;
            startDate: Date;
            shopId: string;
        } | null;
        owner: {
            username: string;
            email: string | null;
            id: string;
        };
    } & {
        shopName: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        ownerId: string;
    })[]>;
    updateShop(shopId: string, data: any): Promise<{
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            expiryDate: Date;
            startDate: Date;
            shopId: string;
        } | null;
        owner: {
            username: string;
            email: string | null;
            id: string;
        };
    } & {
        shopName: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        ownerId: string;
    }>;
    updateSubscription(shopId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        expiryDate: Date;
        startDate: Date;
        shopId: string;
    }>;
    toggleShopStatus(shopId: string, status: string): Promise<{
        shopName: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        ownerId: string;
    }>;
    deleteShop(shopId: string): Promise<{
        message: string;
    }>;
    getRegistrationRequests(): Promise<{
        username: string;
        email: string;
        password: string;
        shopName: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
    }[]>;
    approveRegistrationRequest(requestId: string): Promise<{
        message: string;
        user: {
            username: string;
            email: string | null;
            id: string;
            passwordHash: string;
            role: string;
            createdAt: Date;
            updatedAt: Date;
        };
        shop: {
            shopName: string;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            ownerId: string;
        };
    }>;
    rejectRegistrationRequest(requestId: string): Promise<{
        username: string;
        email: string;
        password: string;
        shopName: string;
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
    }>;
    getStats(): Promise<{
        totalShops: number;
        activeShops: number;
        disabledShops: number;
        expiredSubscriptions: number;
    }>;
}
