import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiWorkflowGeneratorService } from './ai/ai-workflow-generator.service';
import { AiWorkflowDebuggerService } from './ai/ai-workflow-debugger.service';
import { AiWorkflowSimulatorService } from './ai/ai-workflow-simulator.service';
import { AiWorkflowOptimizerService } from './ai/ai-workflow-optimizer.service';
export declare class WorkflowsController {
    private readonly engineService;
    private readonly prisma;
    private readonly workflowsService;
    private readonly generatorService;
    private readonly debuggerService;
    private readonly simulatorService;
    private readonly optimizerService;
    constructor(engineService: WorkflowEngineService, prisma: PrismaService, workflowsService: WorkflowsService, generatorService: AiWorkflowGeneratorService, debuggerService: AiWorkflowDebuggerService, simulatorService: AiWorkflowSimulatorService, optimizerService: AiWorkflowOptimizerService);
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
    updateWorkflowGraph(id: string, body: {
        shopId: string;
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
    generateWorkflow(body: {
        shopId: string;
        prompt: string;
    }): Promise<{
        nodes: any[];
        edges: any[];
        explanation: string;
    }>;
    debugWorkflow(instanceId: string): Promise<import("./ai/ai-workflow-debugger.service").DebugReport>;
    simulateWorkflow(body: {
        shopId: string;
        workflowId: string;
        testMessage: string;
    }): Promise<{
        success: boolean;
        steps: import("./ai/ai-workflow-simulator.service").SimulationStep[];
        finalVariables: Record<string, any>;
    }>;
    optimizeWorkflow(id: string): Promise<import("./ai/ai-workflow-optimizer.service").OptimizationRecommendation>;
    triggerTestWorkflow(id: string, body: {
        shopId: string;
        contactId: string;
    }): Promise<{
        success: boolean;
        instanceId: string;
    }>;
}
