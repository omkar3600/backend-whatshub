import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { WorkflowLinterService } from './engine/workflow-linter.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiWorkflowGeneratorService } from './ai/ai-workflow-generator.service';
import { AiWorkflowDebuggerService } from './ai/ai-workflow-debugger.service';
import { AiWorkflowSimulatorService } from './ai/ai-workflow-simulator.service';
import { AiWorkflowOptimizerService } from './ai/ai-workflow-optimizer.service';
import { AiCopilotService } from './ai/ai-copilot.service';
import { AiRedTeamService } from './ai/ai-red-team.service';
export declare class WorkflowsController {
    private readonly engineService;
    private readonly prisma;
    private readonly workflowsService;
    private readonly linterService;
    private readonly generatorService;
    private readonly debuggerService;
    private readonly simulatorService;
    private readonly optimizerService;
    private readonly copilotService;
    private readonly redTeamService;
    constructor(engineService: WorkflowEngineService, prisma: PrismaService, workflowsService: WorkflowsService, linterService: WorkflowLinterService, generatorService: AiWorkflowGeneratorService, debuggerService: AiWorkflowDebuggerService, simulatorService: AiWorkflowSimulatorService, optimizerService: AiWorkflowOptimizerService, copilotService: AiCopilotService, redTeamService: AiRedTeamService);
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
    copilotEditGraph(body: {
        shopId: string;
        graph: any;
        instruction: string;
    }): Promise<{
        nodes: any[];
        edges: any[];
        explanation: string;
    }>;
    explainGraph(body: {
        shopId: string;
        graph: any;
    }): Promise<{
        explanation: string;
    }>;
    redTeamAudit(body: {
        shopId: string;
        graph: any;
    }): Promise<import("./ai/ai-red-team.service").RedTeamReport>;
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
