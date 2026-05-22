"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TokenRefreshService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRefreshService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("@nestjs/axios");
const crypto_service_1 = require("../common/services/crypto.service");
const rxjs_1 = require("rxjs");
let TokenRefreshService = TokenRefreshService_1 = class TokenRefreshService {
    prisma;
    httpService;
    cryptoService;
    logger = new common_1.Logger(TokenRefreshService_1.name);
    graphApiBase = `https://graph.facebook.com/${process.env.META_API_VERSION || 'v18.0'}`;
    constructor(prisma, httpService, cryptoService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.cryptoService = cryptoService;
    }
    async handleTokenRefresh() {
        this.logger.log('Starting scheduled token refresh check...');
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const expiringAccounts = await this.prisma.whatsAppBusinessAccount.findMany({
            where: {
                status: 'active',
                tokenExpiry: {
                    lte: sevenDaysFromNow,
                    gt: new Date(),
                },
            },
            include: { shop: true },
        });
        this.logger.log(`Found ${expiringAccounts.length} accounts with tokens expiring within 7 days`);
        for (const account of expiringAccounts) {
            try {
                await this.refreshToken(account);
                this.logger.log(`Successfully refreshed token for WABA ${account.wabaId || account.businessAccountId} (shop: ${account.shop.shopName})`);
            }
            catch (error) {
                this.logger.error(`Failed to refresh token for WABA ${account.wabaId || account.businessAccountId}: ${error.message}`);
            }
        }
        const expiredAccounts = await this.prisma.whatsAppBusinessAccount.findMany({
            where: {
                status: 'active',
                tokenExpiry: { lte: new Date() },
            },
        });
        for (const account of expiredAccounts) {
            await this.prisma.whatsAppBusinessAccount.update({
                where: { id: account.id },
                data: { status: 'token_expired' },
            });
            this.logger.warn(`Marked WABA ${account.wabaId || account.businessAccountId} as token_expired`);
        }
        this.logger.log('Token refresh check completed');
    }
    async refreshToken(account) {
        const appId = process.env.META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;
        if (!appId || !appSecret) {
            throw new Error('META_APP_ID and META_APP_SECRET are required for token refresh');
        }
        const currentToken = this.cryptoService.decrypt(account.accessToken);
        const url = `${this.graphApiBase}/oauth/access_token`;
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: appId,
                client_secret: appSecret,
                fb_exchange_token: currentToken,
            },
        }));
        if (!response.data?.access_token) {
            throw new Error('Token refresh returned no access token');
        }
        const newToken = response.data.access_token;
        const encryptedToken = this.cryptoService.encrypt(newToken);
        let tokenExpiry = null;
        try {
            const debugResp = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.graphApiBase}/debug_token`, {
                params: {
                    input_token: newToken,
                    access_token: `${appId}|${appSecret}`,
                },
            }));
            if (debugResp.data?.data?.expires_at) {
                tokenExpiry = new Date(debugResp.data.data.expires_at * 1000);
            }
        }
        catch (e) {
            this.logger.warn('Could not debug new token for expiry info');
        }
        await this.prisma.whatsAppBusinessAccount.update({
            where: { id: account.id },
            data: {
                accessToken: encryptedToken,
                tokenExpiry: tokenExpiry,
                status: 'active',
            },
        });
    }
    async handleHealthCheck() {
        this.logger.log('Starting periodic health check...');
        const activeAccounts = await this.prisma.whatsAppBusinessAccount.findMany({
            where: { status: 'active' },
            include: { phoneNumbers: true },
        });
        for (const account of activeAccounts) {
            try {
                const token = this.cryptoService.decrypt(account.accessToken);
                const wabaId = account.wabaId || account.businessAccountId;
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.graphApiBase}/${wabaId}/phone_numbers`, {
                    params: {
                        access_token: token,
                        fields: 'id,display_phone_number,verified_name,quality_rating,messaging_limit_tier',
                    },
                }));
                const phoneNumbers = response.data?.data || [];
                for (const pn of phoneNumbers) {
                    await this.prisma.whatsAppPhoneNumber.updateMany({
                        where: { phoneNumberId: String(pn.id) },
                        data: {
                            qualityRating: pn.quality_rating,
                            messagingLimit: pn.messaging_limit_tier,
                            verifiedName: pn.verified_name,
                            displayPhoneNumber: pn.display_phone_number,
                        },
                    });
                }
            }
            catch (error) {
                this.logger.warn(`Health check failed for WABA ${account.wabaId}: ${error.message}`);
                if (error?.response?.status === 401 || error?.response?.data?.error?.code === 190) {
                    await this.prisma.whatsAppBusinessAccount.update({
                        where: { id: account.id },
                        data: { status: 'token_expired' },
                    });
                    this.logger.warn(`Marked WABA ${account.wabaId} as token_expired due to auth failure`);
                }
            }
        }
        this.logger.log('Health check completed');
    }
};
exports.TokenRefreshService = TokenRefreshService;
__decorate([
    (0, schedule_1.Cron)('0 2 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenRefreshService.prototype, "handleTokenRefresh", null);
__decorate([
    (0, schedule_1.Cron)('0 */6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenRefreshService.prototype, "handleHealthCheck", null);
exports.TokenRefreshService = TokenRefreshService = TokenRefreshService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService,
        crypto_service_1.CryptoService])
], TokenRefreshService);
//# sourceMappingURL=token-refresh.service.js.map