import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService);
    registerInterest(data: any): Promise<{
        message: string;
    }>;
    registerShop(data: any): Promise<{
        message: string;
        shopId: string;
    }>;
    login(data: any): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            email: string | null;
            role: string;
            shopId: string | undefined;
        };
    }>;
}
