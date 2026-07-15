import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class WorkflowsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listWorkflows(shopId: string): Promise<({
        _count: {
            instances: number;
        };
    } & {
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        description: string | null;
        isTemplate: boolean;
    })[]>;
    getWorkflow(shopId: string, id: string): Promise<{
        versions: {
            id: string;
            status: string;
            createdAt: Date;
            versionNumber: number;
            graph: Prisma.JsonValue;
            workflowId: string;
        }[];
    } & {
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        description: string | null;
        isTemplate: boolean;
    }>;
    createWorkflow(shopId: string, name: string): Promise<{
        versions: {
            id: string;
            status: string;
            createdAt: Date;
            versionNumber: number;
            graph: Prisma.JsonValue;
            workflowId: string;
        }[];
    } & {
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        description: string | null;
        isTemplate: boolean;
    }>;
    updateWorkflowGraph(shopId: string, id: string, graph: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        versionNumber: number;
        graph: Prisma.JsonValue;
        workflowId: string;
    }>;
    publishWorkflow(shopId: string, id: string): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        description: string | null;
        isTemplate: boolean;
    }>;
    deleteWorkflow(shopId: string, id: string): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        description: string | null;
        isTemplate: boolean;
    }>;
}
