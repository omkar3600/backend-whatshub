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
var EmbeddedSignupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddedSignupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("@nestjs/axios");
const crypto_service_1 = require("../common/services/crypto.service");
const rxjs_1 = require("rxjs");
let EmbeddedSignupService = EmbeddedSignupService_1 = class EmbeddedSignupService {
    prisma;
    httpService;
    cryptoService;
    logger = new common_1.Logger(EmbeddedSignupService_1.name);
    graphApiBase = `https://graph.facebook.com/${process.env.META_API_VERSION || 'v18.0'}`;
    constructor(prisma, httpService, cryptoService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.cryptoService = cryptoService;
    }
    getConfig() {
        const appId = process.env.META_APP_ID;
        const configId = process.env.META_CONFIG_ID;
        if (!appId || !configId) {
            throw new common_1.BadRequestException('Meta Embedded Signup is not configured. Set META_APP_ID and META_CONFIG_ID.');
        }
        return {
            appId,
            configId,
            scopes: 'whatsapp_business_management,whatsapp_business_messaging',
        };
    }
    async processCallback(userId, code, sessionInfo, redirectUri) {
        const shop = await this.prisma.shop.findUnique({ where: { ownerId: userId } });
        if (!shop)
            throw new common_1.NotFoundException('Shop not found');
        await this.logOnboardingEvent(shop.id, 'signup_started', { sessionInfo });
        try {
            const tokenData = await this.exchangeCodeForToken(code, redirectUri);
            await this.logOnboardingEvent(shop.id, 'token_exchanged', {
                tokenType: tokenData.token_type,
            });
            const accessToken = tokenData.access_token;
            let tokenExpiry = null;
            try {
                const debugData = await this.debugToken(accessToken);
                if (debugData?.data?.expires_at) {
                    tokenExpiry = new Date(debugData.data.expires_at * 1000);
                }
            }
            catch (e) {
                this.logger.warn('Failed to debug token for expiry info — continuing without expiry date');
            }
            let wabaId;
            let phoneNumberId;
            if (sessionInfo?.waba_id) {
                wabaId = String(sessionInfo.waba_id);
                phoneNumberId = sessionInfo.phone_number_id ? String(sessionInfo.phone_number_id) : undefined;
                this.logger.log(`Got WABA ID ${wabaId} and phone ${phoneNumberId} from session info`);
            }
            if (!wabaId) {
                const debugData = await this.debugToken(accessToken);
                const granularScopes = debugData?.data?.granular_scopes || [];
                for (const scope of granularScopes) {
                    if (scope.scope === 'whatsapp_business_management' && scope.target_ids?.length > 0) {
                        wabaId = String(scope.target_ids[0]);
                        break;
                    }
                }
            }
            if (!wabaId) {
                const wabaData = await this.fetchOwnedWabas(accessToken);
                if (wabaData?.length > 0) {
                    wabaId = String(wabaData[0].id);
                }
            }
            if (!wabaId) {
                await this.logOnboardingEvent(shop.id, 'failed', { error: 'Could not determine WABA ID' });
                throw new common_1.BadRequestException('Could not determine your WhatsApp Business Account ID. Please try again.');
            }
            await this.logOnboardingEvent(shop.id, 'waba_retrieved', { wabaId });
            let businessName;
            let businessId;
            try {
                const wabaDetails = await this.fetchWabaDetails(wabaId, accessToken);
                businessName = wabaDetails?.name;
                businessId = wabaDetails?.business?.id || wabaDetails?.owner_business_info?.id;
            }
            catch (e) {
                this.logger.warn(`Failed to fetch WABA details: ${e.message}`);
            }
            const phoneNumbers = await this.fetchPhoneNumbers(wabaId, accessToken);
            await this.logOnboardingEvent(shop.id, 'phone_retrieved', {
                count: phoneNumbers.length,
                numbers: phoneNumbers.map(p => p.display_phone_number),
            });
            const encryptedToken = this.cryptoService.encrypt(accessToken);
            const wabaAccount = await this.prisma.whatsAppBusinessAccount.upsert({
                where: { id: wabaId },
                create: {
                    shopId: shop.id,
                    businessAccountId: businessId || wabaId,
                    wabaId: wabaId,
                    businessName: businessName,
                    accessToken: encryptedToken,
                    tokenType: 'long_lived',
                    tokenExpiry: tokenExpiry,
                    status: 'active',
                    onboardingSource: 'embedded_signup',
                },
                update: {
                    accessToken: encryptedToken,
                    tokenExpiry: tokenExpiry,
                    status: 'active',
                    businessName: businessName,
                },
            });
            for (const phone of phoneNumbers) {
                await this.prisma.whatsAppPhoneNumber.upsert({
                    where: { phoneNumberId: String(phone.id) },
                    create: {
                        shopId: shop.id,
                        wabaAccountId: wabaAccount.id,
                        phoneNumberId: String(phone.id),
                        displayPhoneNumber: phone.display_phone_number,
                        verifiedName: phone.verified_name,
                        qualityRating: phone.quality_rating,
                        messagingLimit: phone.messaging_limit_tier,
                        status: 'active',
                        isDefault: phoneNumbers.indexOf(phone) === 0,
                    },
                    update: {
                        displayPhoneNumber: phone.display_phone_number,
                        verifiedName: phone.verified_name,
                        qualityRating: phone.quality_rating,
                        messagingLimit: phone.messaging_limit_tier,
                        status: 'active',
                    },
                });
            }
            try {
                await this.subscribeToWebhooks(wabaId, accessToken);
                await this.logOnboardingEvent(shop.id, 'webhook_subscribed', { wabaId });
            }
            catch (e) {
                this.logger.error(`Failed to subscribe to webhooks: ${e.message}`);
            }
            if (phoneNumberId || phoneNumbers[0]?.id) {
                const pnId = phoneNumberId || String(phoneNumbers[0].id);
                try {
                    await this.registerPhoneNumber(pnId, accessToken);
                }
                catch (e) {
                    this.logger.warn(`Phone number registration returned: ${e.message} — may already be registered`);
                }
            }
            await this.logOnboardingEvent(shop.id, 'completed', {
                wabaId,
                phoneNumbers: phoneNumbers.map(p => p.display_phone_number),
                businessName,
            });
            return {
                success: true,
                message: 'WhatsApp Business Account connected successfully',
                wabaAccount: {
                    id: wabaAccount.id,
                    businessName: businessName,
                    wabaId: wabaId,
                    status: 'active',
                },
                phoneNumbers: phoneNumbers.map(p => ({
                    phoneNumberId: String(p.id),
                    displayPhoneNumber: p.display_phone_number,
                    verifiedName: p.verified_name,
                    qualityRating: p.quality_rating,
                })),
            };
        }
        catch (error) {
            const metaApiError = error.response?.data || error.message;
            this.logger.error(`Embedded signup failed for shop ${shop.id}:`, JSON.stringify(metaApiError));
            await this.logOnboardingEvent(shop.id, 'failed', {
                error: metaApiError,
                stack: error.stack,
            });
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to connect WhatsApp. Meta API Error: ${JSON.stringify(metaApiError)}`);
        }
    }
    async getConnectionStatus(userId) {
        const shop = await this.prisma.shop.findUnique({ where: { ownerId: userId } });
        if (!shop)
            throw new common_1.NotFoundException('Shop not found');
        const accounts = await this.prisma.whatsAppBusinessAccount.findMany({
            where: { shopId: shop.id },
            include: { phoneNumbers: true },
            orderBy: { createdAt: 'desc' },
        });
        const result = accounts.map(account => {
            let tokenHealth = 'valid';
            if (account.tokenExpiry) {
                const now = new Date();
                const daysUntilExpiry = (account.tokenExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                if (daysUntilExpiry <= 0) {
                    tokenHealth = 'expired';
                }
                else if (daysUntilExpiry <= 7) {
                    tokenHealth = 'expiring_soon';
                }
            }
            return {
                id: account.id,
                wabaId: account.wabaId || account.businessAccountId,
                businessName: account.businessName,
                status: account.status,
                tokenHealth,
                tokenExpiry: account.tokenExpiry,
                onboardingSource: account.onboardingSource,
                createdAt: account.createdAt,
                phoneNumbers: account.phoneNumbers.map(pn => ({
                    id: pn.id,
                    phoneNumberId: pn.phoneNumberId,
                    displayPhoneNumber: pn.displayPhoneNumber,
                    verifiedName: pn.verifiedName,
                    qualityRating: pn.qualityRating,
                    messagingLimit: pn.messagingLimit,
                    status: pn.status,
                    isDefault: pn.isDefault,
                })),
            };
        });
        return {
            shopId: shop.id,
            isConnected: result.some(a => a.status === 'active'),
            accounts: result,
        };
    }
    async disconnectWaba(userId, wabaAccountId) {
        const shop = await this.prisma.shop.findUnique({ where: { ownerId: userId } });
        if (!shop)
            throw new common_1.NotFoundException('Shop not found');
        const account = await this.prisma.whatsAppBusinessAccount.findFirst({
            where: { id: wabaAccountId, shopId: shop.id },
        });
        if (!account)
            throw new common_1.NotFoundException('WhatsApp Business Account not found');
        await this.prisma.whatsAppBusinessAccount.update({
            where: { id: wabaAccountId },
            data: { status: 'disconnected' },
        });
        await this.prisma.whatsAppPhoneNumber.updateMany({
            where: { wabaAccountId },
            data: { status: 'inactive' },
        });
        await this.logOnboardingEvent(shop.id, 'disconnected', { wabaAccountId });
        return { success: true, message: 'WhatsApp Business Account disconnected' };
    }
    async reconnectWaba(userId, wabaAccountId, code, redirectUri) {
        const shop = await this.prisma.shop.findUnique({ where: { ownerId: userId } });
        if (!shop)
            throw new common_1.NotFoundException('Shop not found');
        const account = await this.prisma.whatsAppBusinessAccount.findFirst({
            where: { id: wabaAccountId, shopId: shop.id },
        });
        if (!account)
            throw new common_1.NotFoundException('WhatsApp Business Account not found');
        const tokenData = await this.exchangeCodeForToken(code, redirectUri);
        const encryptedToken = this.cryptoService.encrypt(tokenData.access_token);
        let tokenExpiry = null;
        try {
            const debugData = await this.debugToken(tokenData.access_token);
            if (debugData?.data?.expires_at) {
                tokenExpiry = new Date(debugData.data.expires_at * 1000);
            }
        }
        catch (e) {
            this.logger.warn('Failed to debug token for expiry');
        }
        await this.prisma.whatsAppBusinessAccount.update({
            where: { id: wabaAccountId },
            data: {
                accessToken: encryptedToken,
                tokenExpiry,
                status: 'active',
            },
        });
        await this.prisma.whatsAppPhoneNumber.updateMany({
            where: { wabaAccountId },
            data: { status: 'active' },
        });
        const wabaId = account.wabaId || account.businessAccountId;
        try {
            await this.subscribeToWebhooks(wabaId, tokenData.access_token);
        }
        catch (e) {
            this.logger.warn(`Failed to re-subscribe to webhooks: ${e.message}`);
        }
        await this.logOnboardingEvent(shop.id, 'reconnected', { wabaAccountId });
        return { success: true, message: 'WhatsApp Business Account reconnected successfully' };
    }
    async exchangeCodeForToken(code, redirectUri) {
        const appId = process.env.META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;
        if (!appId || !appSecret) {
            throw new common_1.BadRequestException('META_APP_ID and META_APP_SECRET must be configured');
        }
        const url = `${this.graphApiBase}/oauth/access_token`;
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
            params: {
                client_id: appId,
                client_secret: appSecret,
                code: code,
                redirect_uri: redirectUri || '',
            },
        }));
        if (!response.data?.access_token) {
            throw new common_1.BadRequestException('Failed to exchange code for access token');
        }
        this.logger.log('Successfully exchanged authorization code for access token');
        return response.data;
    }
    async debugToken(accessToken) {
        const appId = process.env.META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;
        const url = `${this.graphApiBase}/debug_token`;
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
            params: {
                input_token: accessToken,
                access_token: `${appId}|${appSecret}`,
            },
        }));
        return response.data;
    }
    async fetchOwnedWabas(accessToken) {
        try {
            const meResp = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.graphApiBase}/me`, {
                params: { access_token: accessToken, fields: 'id,name' },
            }));
            const businessId = meResp.data.id;
            const wabaResp = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.graphApiBase}/${businessId}/owned_whatsapp_business_accounts`, {
                params: { access_token: accessToken },
            }));
            return wabaResp.data?.data || [];
        }
        catch (e) {
            this.logger.warn(`Failed to fetch owned WABAs: ${e.message}`);
            return [];
        }
    }
    async fetchWabaDetails(wabaId, accessToken) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.graphApiBase}/${wabaId}`, {
            params: {
                access_token: accessToken,
                fields: 'id,name,currency,timezone_id,business,owner_business_info,message_template_namespace',
            },
        }));
        return response.data;
    }
    async fetchPhoneNumbers(wabaId, accessToken) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.graphApiBase}/${wabaId}/phone_numbers`, {
            params: {
                access_token: accessToken,
                fields: 'id,display_phone_number,verified_name,quality_rating,messaging_limit_tier,code_verification_status',
            },
        }));
        return response.data?.data || [];
    }
    async subscribeToWebhooks(wabaId, accessToken) {
        await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.graphApiBase}/${wabaId}/subscribed_apps`, null, {
            params: { access_token: accessToken },
        }));
        this.logger.log(`Subscribed WABA ${wabaId} to webhooks`);
    }
    async registerPhoneNumber(phoneNumberId, accessToken) {
        await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.graphApiBase}/${phoneNumberId}/register`, { messaging_product: 'whatsapp', pin: '123456' }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }));
        this.logger.log(`Registered phone number ${phoneNumberId} for messaging`);
    }
    async logOnboardingEvent(shopId, eventType, metadata) {
        try {
            await this.prisma.onboardingEvent.create({
                data: { shopId, eventType, metadata },
            });
        }
        catch (e) {
            this.logger.error(`Failed to log onboarding event: ${e.message}`);
        }
    }
};
exports.EmbeddedSignupService = EmbeddedSignupService;
exports.EmbeddedSignupService = EmbeddedSignupService = EmbeddedSignupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService,
        crypto_service_1.CryptoService])
], EmbeddedSignupService);
//# sourceMappingURL=embedded-signup.service.js.map