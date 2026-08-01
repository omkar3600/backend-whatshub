import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    createCampaign(user: any, body: any): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getCampaigns(user: any): Promise<{
        contacts: undefined;
        stats: {
            sendDelay: any;
            excludeUnsubscribed: any;
            total: number;
            sent: number;
            delivered: number;
            read: number;
            replied: number;
            clicked: number;
            failed: number;
            pending: number;
        };
        template: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            shopId: string;
            category: string;
            templateName: string;
            language: string;
            components: import("@prisma/client/runtime/library").JsonValue;
        };
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    getCampaignAnalytics(user: any, id: string): Promise<{
        campaign: {
            template: {
                id: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                shopId: string;
                category: string;
                templateName: string;
                language: string;
                components: import("@prisma/client/runtime/library").JsonValue;
            };
            contacts: {
                name: string;
                phone: string;
                id: string;
                status: string;
                updatedAt: Date;
                campaignId: string;
                contactId: string | null;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
        } & {
            name: string;
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            shopId: string;
            stats: import("@prisma/client/runtime/library").JsonValue | null;
            templateId: string;
            targetTags: import("@prisma/client/runtime/library").JsonValue | null;
            targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
            targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
            templateParams: import("@prisma/client/runtime/library").JsonValue | null;
            headerMediaUrl: string | null;
            scheduledAt: Date;
            failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
        };
        stats: {
            total: number;
            sent: number;
            delivered: number;
            read: number;
            replied: number;
            clicked: number;
            failed: number;
            unread: number;
        };
        contacts: {
            all: any[];
            sent: any[];
            delivered: any[];
            read: any[];
            replied: any[];
            clicked: any[];
            failed: any[];
            unread: any[];
        };
    }>;
    addTagsToContacts(user: any, id: string, body: any): Promise<{
        updated: number;
        message: string;
    }>;
    resendFailed(user: any, id: string): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    } | {
        message: string;
    }>;
    abortCampaign(user: any, id: string): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    launchRetarget(user: any, id: string, body: any): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    deleteCampaign(user: any, id: string): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
