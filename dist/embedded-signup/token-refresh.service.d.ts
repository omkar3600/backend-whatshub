import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { CryptoService } from '../common/services/crypto.service';
export declare class TokenRefreshService {
    private prisma;
    private httpService;
    private cryptoService;
    private readonly logger;
    private readonly graphApiBase;
    constructor(prisma: PrismaService, httpService: HttpService, cryptoService: CryptoService);
    handleTokenRefresh(): Promise<void>;
    private refreshToken;
    handleHealthCheck(): Promise<void>;
}
