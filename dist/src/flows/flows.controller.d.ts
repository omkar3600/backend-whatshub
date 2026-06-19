import { FlowsService } from './flows.service';
export declare class FlowsController {
    private readonly flowsService;
    constructor(flowsService: FlowsService);
    createFlow(user: any, body: any): Promise<{
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
    getFlows(user: any): Promise<{
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
    getFlow(user: any, id: string): Promise<{
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
    getFlowAnalytics(user: any, id: string): Promise<{}>;
    getFlowVersions(user: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        versionNumber: number;
    }[]>;
    getFlowVersion(user: any, id: string, versionId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        nodes: import("@prisma/client/runtime/library").JsonValue | null;
        edges: import("@prisma/client/runtime/library").JsonValue | null;
        flowId: string;
        versionNumber: number;
    }>;
    simulateFlow(id: string, body: any): Promise<import("./flow-engine.service").SimulationResult>;
    updateFlow(user: any, id: string, body: any): Promise<{
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
    deleteFlow(user: any, id: string): Promise<{
        message: string;
    }>;
    updateSettings(user: any, id: string, body: any): Promise<{
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
}
