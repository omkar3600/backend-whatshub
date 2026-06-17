import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class SequencesService {
    private prisma;
    private sequencesQueue;
    constructor(prisma: PrismaService, sequencesQueue: Queue);
    createSequence(shopId: string, data: {
        name: string;
        triggerTag: string;
        steps: any[];
    }): Promise<{
        steps: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            stepNumber: number;
            delayHours: number;
            templateParams: import("@prisma/client/runtime/library").JsonValue | null;
            templateId: string;
            sequenceId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        triggerTag: string | null;
    }>;
    getSequences(shopId: string): Promise<({
        _count: {
            subscribers: number;
        };
        steps: ({
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            stepNumber: number;
            delayHours: number;
            templateParams: import("@prisma/client/runtime/library").JsonValue | null;
            templateId: string;
            sequenceId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        triggerTag: string | null;
    })[]>;
    toggleSequence(shopId: string, id: string, isActive: boolean): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        triggerTag: string | null;
    }>;
    deleteSequence(shopId: string, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        triggerTag: string | null;
    }>;
    handleContactTagsUpdated(shopId: string, contactId: string, tags: string[]): Promise<void>;
    enqueueStep(subscriberId: string, stepId: string, delayHours: number): Promise<void>;
}
