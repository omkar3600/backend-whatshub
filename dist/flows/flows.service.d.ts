import { PrismaService } from '../prisma/prisma.service';
import { FlowEngineService } from './flow-engine.service';
export declare class FlowsService {
    private prisma;
    private flowEngine;
    constructor(prisma: PrismaService, flowEngine: FlowEngineService);
    createFlow(shopId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        shopId: string;
        description: string | null;
        category: string;
        nodeCount: number;
        nodes: import("@prisma/client/runtime/library").JsonValue | null;
        edges: import("@prisma/client/runtime/library").JsonValue | null;
        triggerKeyword: string | null;
        isDefault: boolean;
    }>;
    getFlows(shopId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        shopId: string;
        description: string | null;
        category: string;
        nodeCount: number;
        nodes: import("@prisma/client/runtime/library").JsonValue | null;
        edges: import("@prisma/client/runtime/library").JsonValue | null;
        triggerKeyword: string | null;
        isDefault: boolean;
    }[]>;
    getFlow(shopId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        shopId: string;
        description: string | null;
        category: string;
        nodeCount: number;
        nodes: import("@prisma/client/runtime/library").JsonValue | null;
        edges: import("@prisma/client/runtime/library").JsonValue | null;
        triggerKeyword: string | null;
        isDefault: boolean;
    }>;
    updateFlow(shopId: string, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        shopId: string;
        description: string | null;
        category: string;
        nodeCount: number;
        nodes: import("@prisma/client/runtime/library").JsonValue | null;
        edges: import("@prisma/client/runtime/library").JsonValue | null;
        triggerKeyword: string | null;
        isDefault: boolean;
    }>;
    getFlowVersions(shopId: string, flowId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        versionNumber: number;
    }[]>;
    getFlowVersion(shopId: string, flowId: string, versionId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        nodes: import("@prisma/client/runtime/library").JsonValue | null;
        edges: import("@prisma/client/runtime/library").JsonValue | null;
        flowId: string;
        versionNumber: number;
    }>;
    deleteFlow(shopId: string, id: string): Promise<{
        message: string;
    }>;
    updateSettings(shopId: string, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        shopId: string;
        description: string | null;
        category: string;
        nodeCount: number;
        nodes: import("@prisma/client/runtime/library").JsonValue | null;
        edges: import("@prisma/client/runtime/library").JsonValue | null;
        triggerKeyword: string | null;
        isDefault: boolean;
    }>;
    getFlowAnalytics(shopId: string, flowId: string): Promise<{}>;
    simulateFlow(id: string, data: any): Promise<import("./flow-engine.service").SimulationResult>;
}
