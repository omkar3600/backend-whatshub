import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    createShop(data: any): Promise<{
        message: string;
        shop: any;
        subscription: any;
    }>;
    getShops(): Promise<any>;
    updateShop(shopId: string, data: any): Promise<any>;
    updateSubscription(shopId: string, data: any): Promise<any>;
    toggleShopStatus(shopId: string, status: string): Promise<any>;
    deleteShop(shopId: string): Promise<any>;
    getRegistrationRequests(): Promise<any>;
    approveRegistrationRequest(requestId: string): Promise<any>;
    rejectRegistrationRequest(requestId: string): Promise<any>;
    getStats(): Promise<{
        totalShops: any;
        activeShops: any;
        disabledShops: any;
        expiredSubscriptions: any;
    }>;
}
