import { PrismaService } from '../prisma/prisma.service';
import { FlowEngineService } from './flow-engine.service';
export declare class FlowsService {
    private prisma;
    private flowEngine;
    constructor(prisma: PrismaService, flowEngine: FlowEngineService);
    createFlow(shopId: string, data: any): Promise<any>;
    getFlows(shopId: string): Promise<any>;
    getFlow(shopId: string, id: string): Promise<any>;
    updateFlow(shopId: string, id: string, data: any): Promise<any>;
    getFlowVersions(shopId: string, flowId: string): Promise<any>;
    getFlowVersion(shopId: string, flowId: string, versionId: string): Promise<any>;
    deleteFlow(shopId: string, id: string): Promise<{
        message: string;
    }>;
    updateSettings(shopId: string, id: string, data: any): Promise<any>;
    getFlowAnalytics(shopId: string, flowId: string): Promise<any>;
    simulateFlow(id: string, data: any): Promise<import("./flow-engine.service").SimulationResult>;
}
