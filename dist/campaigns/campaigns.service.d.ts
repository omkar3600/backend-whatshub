import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class CampaignsService {
    private prisma;
    private campaignsQueue;
    constructor(prisma: PrismaService, campaignsQueue: Queue);
    createCampaign(shopId: string, data: any): Promise<{
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
    getCampaigns(shopId: string): Promise<{
        contacts: undefined;
        stats: {
            sendDelay: any;
            excludeUnsubscribed: any;
            total: number;
            sent: number;
            delivered: number;
            read: number;
            clicked: number;
            failed: number;
            pending: number;
        };
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        shopId: string;
        templateId: string;
        targetTags: import("@prisma/client/runtime/library").JsonValue | null;
        targetPhones: import("@prisma/client/runtime/library").JsonValue | null;
        scheduledAt: Date;
        templateParams: import("@prisma/client/runtime/library").JsonValue | null;
        headerMediaUrl: string | null;
        failureHistory: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    deleteCampaign(shopId: string, campaignId: string): Promise<{
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
    abortCampaign(shopId: string, campaignId: string): Promise<{
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
    launchRetarget(shopId: string, campaignId: string, body: {
        name: string;
        templateId: string;
        phones: string[];
    }): Promise<{
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
    getCampaignAnalytics(shopId: string, campaignId: string): Promise<{
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
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
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
            unread: number;
        };
        contacts: {
            sent: {
                phone: string;
                id: string;
                updatedAt: Date;
                name: string;
                status: string;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            delivered: {
                phone: string;
                id: string;
                updatedAt: Date;
                name: string;
                status: string;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            read: {
                phone: string;
                id: string;
                updatedAt: Date;
                name: string;
                status: string;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            clicked: {
                phone: string;
                id: string;
                updatedAt: Date;
                name: string;
                status: string;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            failed: {
                phone: string;
                id: string;
                updatedAt: Date;
                name: string;
                status: string;
                contactId: string | null;
                campaignId: string;
                wamid: string | null;
                failReason: string | null;
                sentAt: Date;
            }[];
            unread: {
                phone: string;
                id: string;
                updatedAt: Date;
                name: string;
                status: string;
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
}
