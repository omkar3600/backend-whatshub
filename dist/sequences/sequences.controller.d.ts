import { SequencesService } from './sequences.service';
export declare class SequencesController {
    private readonly sequencesService;
    constructor(sequencesService: SequencesService);
    create(req: any, data: {
        name: string;
        triggerType: string;
        triggerTag?: string;
        triggerKeyword?: string;
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
        triggerKeyword: string | null;
        triggerType: string;
        triggerTag: string | null;
    }>;
    findAll(req: any): Promise<({
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
        triggerKeyword: string | null;
        triggerType: string;
        triggerTag: string | null;
    })[]>;
    getAnalytics(req: any, id: string): Promise<{
        totalEnrolled: number;
        stepBreakdown: {
            step: number;
            status: string;
            count: number;
        }[];
    }>;
    toggle(req: any, id: string, data: {
        isActive: boolean;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        triggerKeyword: string | null;
        triggerType: string;
        triggerTag: string | null;
    }>;
    delete(req: any, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        isActive: boolean;
        triggerKeyword: string | null;
        triggerType: string;
        triggerTag: string | null;
    }>;
}
