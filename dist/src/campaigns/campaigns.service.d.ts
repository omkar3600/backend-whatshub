import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class CampaignsService {
    private prisma;
    private campaignsQueue;
    constructor(prisma: PrismaService, campaignsQueue: Queue);
    createCampaign(shopId: string, data: any): Promise<{
        id: string;
        shopId: string;
        name: string;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        status: string;
        scheduledAt: Date;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCampaigns(shopId: string): Promise<{
        contacts: undefined;
        stats: any;
        template: {
            id: string;
            shopId: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            templateName: string;
            language: string;
            components: import("@prisma/client/runtime/library").JsonValue;
        };
        id: string;
        shopId: string;
        name: string;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        status: string;
        scheduledAt: Date;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    deleteCampaign(shopId: string, campaignId: string): Promise<{
        id: string;
        shopId: string;
        name: string;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        status: string;
        scheduledAt: Date;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    abortCampaign(shopId: string, campaignId: string): Promise<{
        id: string;
        shopId: string;
        name: string;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        status: string;
        scheduledAt: Date;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    launchRetarget(shopId: string, campaignId: string, body: {
        name: string;
        templateId: string;
        phones: string[];
    }): Promise<{
        id: string;
        shopId: string;
        name: string;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        status: string;
        scheduledAt: Date;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCampaignAnalytics(shopId: string, campaignId: string): Promise<{
        campaign: {
            template: {
                id: string;
                shopId: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                category: string;
                templateName: string;
                language: string;
                components: import("@prisma/client/runtime/library").JsonValue;
            };
            contacts: {
                id: string;
                name: string;
                status: string;
                updatedAt: Date;
                phone: string;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
        } & {
            id: string;
            shopId: string;
            name: string;
            templateId: string;
            targetTags: import("@prisma/client/runtime/library").JsonValue | null;
            targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
            targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
            templateParams: import("@prisma/client/runtime/library").JsonValue | null;
            headerMediaUrl: string | null;
            status: string;
            scheduledAt: Date;
            stats: import("@prisma/client/runtime/library").JsonValue | null;
            failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
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
                id: string;
                name: string;
                status: string;
                updatedAt: Date;
                phone: string;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            delivered: {
                id: string;
                name: string;
                status: string;
                updatedAt: Date;
                phone: string;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            read: {
                id: string;
                name: string;
                status: string;
                updatedAt: Date;
                phone: string;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            replied: {
                id: string;
                name: string;
                status: string;
                updatedAt: Date;
                phone: string;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            clicked: {
                id: string;
                name: string;
                status: string;
                updatedAt: Date;
                phone: string;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            failed: {
                id: string;
                name: string;
                status: string;
                updatedAt: Date;
                phone: string;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            unread: {
                id: string;
                name: string;
                status: string;
                updatedAt: Date;
                phone: string;
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
        id: string;
        shopId: string;
        name: string;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        targetFilters: import("@prisma/client/runtime/library").JsonValue | null;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        status: string;
        scheduledAt: Date;
        stats: import("@prisma/client/runtime/library").JsonValue | null;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    } | {
        message: string;
    }>;
}
