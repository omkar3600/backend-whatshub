import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class WorkflowsController {
    private readonly engineService;
    private readonly prisma;
    private readonly workflowsService;
    constructor(engineService: WorkflowEngineService, prisma: PrismaService, workflowsService: WorkflowsService);
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
            graph: import("@prisma/client/runtime/library").JsonValue;
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
    createWorkflow(body: {
        shopId: string;
        name: string;
    }): Promise<{
        versions: {
            id: string;
            status: string;
            createdAt: Date;
            versionNumber: number;
            graph: import("@prisma/client/runtime/library").JsonValue;
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
    updateWorkflowGraph(id: string, body: {
        shopId: string;
        graph: any;
    }): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        versionNumber: number;
        graph: import("@prisma/client/runtime/library").JsonValue;
        workflowId: string;
    }>;
    publishWorkflow(id: string, body: {
        shopId: string;
    }): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        description: string | null;
        isTemplate: boolean;
    }>;
    deleteWorkflow(id: string, shopId: string): Promise<{
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        shopId: string;
        description: string | null;
        isTemplate: boolean;
    }>;
    triggerTestWorkflow(id: string, body: {
        shopId: string;
        contactId: string;
    }): Promise<{
        success: boolean;
        instanceId: string;
    }>;
    createTestWorkflow(body: {
        shopId: string;
    }): Promise<{
        success: boolean;
        workflowId: string;
    }>;
}
