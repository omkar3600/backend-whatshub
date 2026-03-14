import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TemplatesService {
    private readonly logger = new Logger(TemplatesService.name);
    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
    ) { }

    async createTemplate(shopId: string, data: any) {
        const { templateName, category, language, components } = data;
        const creds = await this.prisma.whatsAppCredential.findUnique({ where: { shopId } });

        if (!creds) {
            throw new BadRequestException('WhatsApp credentials not found. Please configure them in Settings.');
        }

        this.logger.log(`Submitting template "${templateName}" to Meta for shop ${shopId}`);

        const url = `https://graph.facebook.com/v18.0/${creds.businessAccountId}/message_templates`;

        try {
            const metaPayload = { name: templateName, category, language, components };
            this.logger.log(`[Template] Sending to Meta: ${JSON.stringify(metaPayload)}`);
            // 1. Submit to Meta
            const metaResponse = await firstValueFrom(
                this.httpService.post(url, metaPayload, {
                    headers: {
                        Authorization: `Bearer ${creds.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                })
            );

            this.logger.log(`Meta response for "${templateName}":`, metaResponse.data);

            // 2. Save locally
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
        } catch (error) {
            const errorData = error.response?.data?.error;
            const errorMsg = errorData?.message || error.message;
            this.logger.error(`[Template Meta Error] Shop ${shopId}, Template "${templateName}": ${JSON.stringify(errorData || error.message)}`);
            throw new BadRequestException(`Meta API Error: ${errorMsg}`);
        }
    }

    async syncTemplates(shopId: string) {
        const creds = await this.prisma.whatsAppCredential.findUnique({ where: { shopId } });
        if (!creds) throw new BadRequestException('WhatsApp credentials not found');

        const url = `https://graph.facebook.com/v18.0/${creds.businessAccountId}/message_templates`;

        try {
            const response = await firstValueFrom(
                this.httpService.get(url, {
                    headers: { Authorization: `Bearer ${creds.accessToken}` }
                })
            );

            const metaTemplates = response.data.data; // Meta returns { data: [...] }
            let updated = 0;
            let imported = 0;

            for (const mt of metaTemplates) {
                // Check if template exists locally
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
                } else {
                    // Import missing template
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
        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            this.logger.error('Failed to sync templates from Meta:', errorMsg);
            throw new BadRequestException(`Sync failed: ${errorMsg}`);
        }
    }

    async getTemplates(shopId: string) {
        // Return cached templates immediately (no Meta API call on every load)
        // Use the explicit /sync endpoint or the webhook for status updates
        return this.prisma.template.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async deleteTemplate(shopId: string, id: string) {
        // 1. Get template details
        const template = await this.prisma.template.findFirst({
            where: { id, shopId }
        });

        if (!template) {
            throw new NotFoundException('Template not found');
        }

        // 3. Delete from Meta
        const creds = await this.prisma.whatsAppCredential.findUnique({ where: { shopId } });
        if (creds) {
            // Meta DELETE endpoint: /v18.0/{waba_id}/message_templates?name={template_name}
            const url = `https://graph.facebook.com/v18.0/${creds.businessAccountId}/message_templates`;
            try {
                await firstValueFrom(
                    this.httpService.delete(url, {
                        params: { name: template.templateName },
                        headers: { Authorization: `Bearer ${creds.accessToken}` }
                    })
                );
                this.logger.log(`Deleted template "${template.templateName}" from Meta for shop ${shopId}`);
            } catch (error) {
                const errorMsg = error.response?.data?.error?.message || error.message;
                this.logger.warn(`Failed to delete template "${template.templateName}" from Meta: ${errorMsg}`);
                // Note: We proceed with local deletion even if Meta fails (e.g. if it was already deleted there)
            }
        }

        // 4. Delete locally (explicitly delete campaigns first to ensure no FK constraint error)
        try {
            const deletedCampaigns = await this.prisma.campaign.deleteMany({ where: { templateId: id } });
            if (deletedCampaigns.count > 0) {
                this.logger.log(`Deleted ${deletedCampaigns.count} campaign(s) linked to template ${id}`);
            }
            await this.prisma.template.delete({ where: { id } });
            return { message: 'Template deleted' };
        } catch (error) {
            this.logger.error(`Failed to delete template ${id} locally: ${error.message}`);
            throw new BadRequestException('Failed to delete template from local database');
        }
    }
}
