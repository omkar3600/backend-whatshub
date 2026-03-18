import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createShop(body: any): Promise<{
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
    updateSubscription(shopId: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        expiryDate: Date;
        startDate: Date;
        shopId: string;
    }>;
    updateShop(shopId: string, body: any): Promise<{
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
    toggleShopStatus(shopId: string, body: any): Promise<{
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
    getStats(): Promise<{
        totalShops: number;
        activeShops: number;
        disabledShops: number;
        expiredSubscriptions: number;
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
    approveRequest(id: string): Promise<{
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
    rejectRequest(id: string): Promise<{
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
}
