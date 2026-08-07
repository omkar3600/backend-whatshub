import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { WorkflowLinterService } from './engine/workflow-linter.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class WorkflowsController {
    private readonly engineService;
    private readonly prisma;
    private readonly workflowsService;
    private readonly linterService;
    constructor(engineService: WorkflowEngineService, prisma: PrismaService, workflowsService: WorkflowsService, linterService: WorkflowLinterService);
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
    getWorkflowVersions(id: string, shopId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        versionNumber: number;
        workflowId: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getWorkflow(id: string, shopId: string): Promise<{
        versions: {
            id: string;
            status: string;
            createdAt: Date;
            versionNumber: number;
            workflowId: string;
            graph: import("@prisma/client/runtime/library").JsonValue;
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
            workflowId: string;
            graph: import("@prisma/client/runtime/library").JsonValue;
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
    createWorkflowVersion(id: string, queryShopId: string, body: {
        shopId?: string;
        graph: any;
    }): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        versionNumber: number;
        workflowId: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateWorkflowGraph(id: string, queryShopId: string, body: {
        shopId?: string;
        graph: any;
    }): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        versionNumber: number;
        workflowId: string;
        graph: import("@prisma/client/runtime/library").JsonValue;
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
    lintWorkflow(body: {
        graph: any;
    }): Promise<{
        issues: import("./engine/workflow-linter.service").LintIssue[];
    }>;
    triggerTestWorkflow(id: string, body: {
        shopId: string;
        contactId: string;
    }): Promise<{
        success: boolean;
        instanceId: string;
    }>;
}
