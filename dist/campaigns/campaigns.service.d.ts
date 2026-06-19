import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class CampaignsService {
    private prisma;
    private campaignsQueue;
    constructor(prisma: PrismaService, campaignsQueue: Queue);
    createCampaign(shopId: string, data: any): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getCampaigns(shopId: string): Promise<{
        contacts: undefined;
        stats: any;
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
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    deleteCampaign(shopId: string, campaignId: string): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    abortCampaign(shopId: string, campaignId: string): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    launchRetarget(shopId: string, campaignId: string, body: {
        name: string;
        templateId: string;
        phones: string[];
    }): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getCampaignAnalytics(shopId: string, campaignId: string): Promise<{
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
                contactId: string | null;
                campaignId: string;
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
            templateParams: import("@prisma/client/runtime/library").JsonValue | null;
            templateId: string;
            targetTags: import("@prisma/client/runtime/library").JsonValue | null;
            targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
            targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
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
            sent: {
                name: string;
                phone: string;
                id: string;
                status: string;
                updatedAt: Date;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            delivered: {
                name: string;
                phone: string;
                id: string;
                status: string;
                updatedAt: Date;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            read: {
                name: string;
                phone: string;
                id: string;
                status: string;
                updatedAt: Date;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            replied: {
                name: string;
                phone: string;
                id: string;
                status: string;
                updatedAt: Date;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            clicked: {
                name: string;
                phone: string;
                id: string;
                status: string;
                updatedAt: Date;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            failed: {
                name: string;
                phone: string;
                id: string;
                status: string;
                updatedAt: Date;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            unread: {
                name: string;
                phone: string;
                id: string;
                status: string;
                updatedAt: Date;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
        };
    }>;
    addTagsToContacts(shopId: string, campaignId: string, body: {
        phones: string[];
        tags: string[];
    }): Promise<{
        updated: number;
        message: string;
    }>;
    resendFailed(shopId: string, campaignId: string): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    } | {
        message: string;
    }>;
}
