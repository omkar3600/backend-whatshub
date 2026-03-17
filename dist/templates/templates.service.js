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
var TemplatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let TemplatesService = TemplatesService_1 = class TemplatesService {
    prisma;
    httpService;
    logger = new common_1.Logger(TemplatesService_1.name);
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
    }
    async createTemplate(shopId, data) {
        const { templateName, category, language, components } = data;
        const creds = await this.prisma.whatsAppCredential.findUnique({ where: { shopId } });
        if (!creds) {
            throw new common_1.BadRequestException('WhatsApp credentials not found. Please configure them in Settings.');
        }
        this.logger.log(`Submitting template "${templateName}" to Meta for shop ${shopId}`);
        const url = `https://graph.facebook.com/v18.0/${creds.businessAccountId}/message_templates`;
        try {
            const metaPayload = { name: templateName, category, language, components };
            this.logger.log(`[Template] Sending to Meta: ${JSON.stringify(metaPayload)}`);
            const metaResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, metaPayload, {
                headers: {
                    Authorization: `Bearer ${creds.accessToken}`,
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`Meta response for "${templateName}":`, metaResponse.data);
            return await this.prisma.template.create({
                data: {
                    shopId,
                    templateName,
                    category,
                    language,
                    components,
                    status: 'pending',
                },
            });
        }
        catch (error) {
            const errorData = error.response?.data?.error;
            const errorMsg = errorData?.message || error.message;
            this.logger.error(`[Template Meta Error] Shop ${shopId}, Template "${templateName}": ${JSON.stringify(errorData || error.message)}`);
            throw new common_1.BadRequestException(`Meta API Error: ${errorMsg}`);
        }
    }
    async syncTemplates(shopId) {
        const creds = await this.prisma.whatsAppCredential.findUnique({ where: { shopId } });
        if (!creds)
            throw new common_1.BadRequestException('WhatsApp credentials not found');
        const url = `https://graph.facebook.com/v18.0/${creds.businessAccountId}/message_templates`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
                headers: { Authorization: `Bearer ${creds.accessToken}` }
            }));
            const metaTemplates = response.data.data;
            let updated = 0;
            let imported = 0;
            for (const mt of metaTemplates) {
                const existing = await this.prisma.template.findFirst({
                    where: {
                        shopId,
                        templateName: mt.name,
                        language: mt.language
                    }
                });
                if (existing) {
                    await this.prisma.template.update({
                        where: { id: existing.id },
                        data: { status: mt.status.toLowerCase() }
                    });
                    updated++;
                }
                else {
                    await this.prisma.template.create({
                        data: {
                            shopId,
                            templateName: mt.name,
                            category: mt.category,
                            language: mt.language,
                            components: mt.components,
                            status: mt.status.toLowerCase()
                        }
                    });
                    imported++;
                }
            }
            return { message: 'Templates synced successfully', updated, imported };
        }
        catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            this.logger.error('Failed to sync templates from Meta:', errorMsg);
            throw new common_1.BadRequestException(`Sync failed: ${errorMsg}`);
        }
    }
    async getTemplates(shopId) {
        return this.prisma.template.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteTemplate(shopId, id) {
        const template = await this.prisma.template.findFirst({
            where: { id, shopId }
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        const creds = await this.prisma.whatsAppCredential.findUnique({ where: { shopId } });
        if (creds) {
            const url = `https://graph.facebook.com/v18.0/${creds.businessAccountId}/message_templates`;
            try {
                await (0, rxjs_1.firstValueFrom)(this.httpService.delete(url, {
                    params: { name: template.templateName },
                    headers: { Authorization: `Bearer ${creds.accessToken}` }
                }));
                this.logger.log(`Deleted template "${template.templateName}" from Meta for shop ${shopId}`);
            }
            catch (error) {
                const errorMsg = error.response?.data?.error?.message || error.message;
                this.logger.warn(`Failed to delete template "${template.templateName}" from Meta: ${errorMsg}`);
            }
        }
        try {
            const deletedCampaigns = await this.prisma.campaign.deleteMany({ where: { templateId: id } });
            if (deletedCampaigns.count > 0) {
                this.logger.log(`Deleted ${deletedCampaigns.count} campaign(s) linked to template ${id}`);
            }
            await this.prisma.template.delete({ where: { id } });
            return { message: 'Template deleted' };
        }
        catch (error) {
            this.logger.error(`Failed to delete template ${id} locally: ${error.message}`);
            throw new common_1.BadRequestException('Failed to delete template from local database');
        }
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = TemplatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map