import { PrismaService } from '../prisma/prisma.service';
import { FlowEngineService } from './flow-engine.service';
export declare class FlowsService {
    private prisma;
    private flowEngine;
    constructor(prisma: PrismaService, flowEngine: FlowEngineService);
    createFlow(shopId: string, data: any): Promise<{
        id: string;
        shopId: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        isDefault: boolean;
        description: string | null;
        category: string;
        nodeCount: number;
        nodes: import("@prisma/client/runtime/library").JsonValue | null;
        edges: import("@prisma/client/runtime/library").JsonValue | null;
        triggerKeyword: string | null;
    }>;
    getFlows(shopId: string): Promise<{
        id: string;
        shopId: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        isDefault: boolean;
        description: string | null;
        category: string;
        nodeCount: number;
        nodes: import("@prisma/client/runtime/library").JsonValue | null;
        edges: import("@prisma/client/runtime/library").JsonValue | null;
        triggerKeyword: string | null;
    }[]>;
    getFlow(shopId: string, id: string): Promise<{
        id: string;
        shopId: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        isDefault: boolean;
        description: string | null;
        category: string;
        nodeCount: number;
        nodes: import("@prisma/client/runtime/library").JsonValue | null;
        edges: import("@prisma/client/runtime/library").JsonValue | null;
        triggerKeyword: string | null;
    }>;
    updateFlow(shopId: string, id: string, data: any): Promise<{
        id: string;
        shopId: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        isDefault: boolean;
        description: string | null;
        category: string;
        nodeCount: number;
        nodes: import("@prisma/client/runtime/library").JsonValue | null;
        edges: import("@prisma/client/runtime/library").JsonValue | null;
        triggerKeyword: string | null;
    }>;
    getFlowVersions(shopId: string, flowId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        versionNumber: number;
    }[]>;
    getFlowVersion(shopId: string, flowId: string, versionId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
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
        shopId: string;
        name: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        isDefault: boolean;
        description: string | null;
        category: string;
        nodeCount: number;
        nodes: import("@prisma/client/runtime/library").JsonValue | null;
        edges: import("@prisma/client/runtime/library").JsonValue | null;
        triggerKeyword: string | null;
    }>;
    getFlowAnalytics(shopId: string, flowId: string): Promise<{}>;
    simulateFlow(id: string, data: any): Promise<import("./flow-engine.service").SimulationResult>;
}
