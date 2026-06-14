import { FlowsService } from './flows.service';
export declare class FlowsController {
    private readonly flowsService;
    constructor(flowsService: FlowsService);
    createFlow(user: any, body: any): Promise<any>;
    getFlows(user: any): Promise<any>;
    getFlow(user: any, id: string): Promise<any>;
    getFlowAnalytics(user: any, id: string): Promise<any>;
    getFlowVersions(user: any, id: string): Promise<any>;
    getFlowVersion(user: any, id: string, versionId: string): Promise<any>;
    simulateFlow(id: string, body: any): Promise<import("./flow-engine.service").SimulationResult>;
    updateFlow(user: any, id: string, body: any): Promise<any>;
    deleteFlow(user: any, id: string): Promise<{
        message: string;
    }>;
    updateSettings(user: any, id: string, body: any): Promise<any>;
}
