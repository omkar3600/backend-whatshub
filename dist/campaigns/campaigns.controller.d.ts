import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    createCampaign(user: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        scheduledAt: Date;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getCampaigns(user: any): Promise<({
        template: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            shopId: string;
            category: string;
            templateName: string;
            language: string;
            components: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        scheduledAt: Date;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getCampaignAnalytics(user: any, id: string): Promise<{
        campaign: {
            template: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                shopId: string;
                category: string;
                templateName: string;
                language: string;
                components: import("@prisma/client/runtime/library").JsonValue;
            };
            contacts: {
                phone: string;
                id: string;
                updatedAt: Date;
                name: string;
                status: string;
                contactId: string | null;
                sentAt: Date;
                campaignId: string;
                failReason: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: string;
            shopId: string;
            stats: import("@prisma/client/runtime/library").JsonValue | null;
            templateId: string;
            targetTags: import("@prisma/client/runtime/library").JsonValue | null;
            targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
            scheduledAt: Date;
            templateParams: import("@prisma/client/runtime/library").JsonValue | null;
            headerMediaUrl: string | null;
            failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
        };
        stats: {
            total: number;
            sent: number;
            delivered: number;
            read: number;
            clicked: number;
            failed: number;
        };
        contacts: {
            sent: {
                phone: string;
                id: string;
                updatedAt: Date;
                name: string;
                status: string;
                contactId: string | null;
                sentAt: Date;
                campaignId: string;
                failReason: string | null;
            }[];
            delivered: {
                phone: string;
                id: string;
                updatedAt: Date;
                name: string;
                status: string;
                contactId: string | null;
                sentAt: Date;
                campaignId: string;
                failReason: string | null;
            }[];
            read: {
                phone: string;
                id: string;
                updatedAt: Date;
                name: string;
                status: string;
                contactId: string | null;
                sentAt: Date;
                campaignId: string;
                failReason: string | null;
            }[];
            clicked: {
                phone: string;
                id: string;
                updatedAt: Date;
                name: string;
                status: string;
                contactId: string | null;
                sentAt: Date;
                campaignId: string;
                failReason: string | null;
            }[];
            failed: {
                phone: string;
                id: string;
                updatedAt: Date;
                name: string;
                status: string;
                contactId: string | null;
                sentAt: Date;
                campaignId: string;
                failReason: string | null;
            }[];
        };
    }>;
    addTagsToContacts(user: any, id: string, body: any): Promise<{
        updated: number;
        message: string;
    }>;
    resendFailed(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        scheduledAt: Date;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    } | {
        message: string;
    }>;
    abortCampaign(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        scheduledAt: Date;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    launchRetarget(user: any, id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        scheduledAt: Date;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    deleteCampaign(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        scheduledAt: Date;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
