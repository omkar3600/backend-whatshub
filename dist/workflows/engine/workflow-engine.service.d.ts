import { PrismaService } from '../../prisma/prisma.service';
import { NodeExecutorRegistry } from './registries/node-executor.registry';
import { ExpressionEngineService } from './expression-engine.service';
import { Queue } from 'bullmq';
export declare class WorkflowEngineService {
    private readonly prisma;
    private readonly nodeRegistry;
    private readonly expressionEngine;
    private readonly executionQueue;
    private readonly logger;
    constructor(prisma: PrismaService, nodeRegistry: NodeExecutorRegistry, expressionEngine: ExpressionEngineService, executionQueue: Queue);
    startWorkflow(shopId: string, workflowId: string, contactId: string, initialVariables?: Record<string, any>): Promise<{
        id: string;
        status: string;
        updatedAt: Date;
        shopId: string;
        contactId: string;
        workflowId: string;
        currentNodeId: string | null;
        previousNodeId: string | null;
        lastExecutedNodeId: string | null;
        variables: import("@prisma/client/runtime/library").JsonValue;
        resumeToken: string | null;
        executionVersion: number;
        entryTime: Date;
        enteredNodeAt: Date | null;
        lastExecutionAt: Date | null;
        completionTime: Date | null;
        workflowVersionId: string;
    }>;
    enqueueNodeExecution(instanceId: string, nodeId: string, delayMs?: number): Promise<void>;
    processNode(jobId: string, instanceId: string, nodeId: string): Promise<void>;
    private handleExecutionResult;
}
