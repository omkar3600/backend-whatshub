"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WorkflowEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const node_executor_registry_1 = require("./registries/node-executor.registry");
const expression_engine_service_1 = require("./expression-engine.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const uuid_1 = require("uuid");
let WorkflowEngineService = WorkflowEngineService_1 = class WorkflowEngineService {
    prisma;
    nodeRegistry;
    expressionEngine;
    executionQueue;
    logger = new common_1.Logger(WorkflowEngineService_1.name);
    constructor(prisma, nodeRegistry, expressionEngine, executionQueue) {
        this.prisma = prisma;
        this.nodeRegistry = nodeRegistry;
        this.expressionEngine = expressionEngine;
        this.executionQueue = executionQueue;
    }
    async startWorkflow(shopId, workflowId, contactId, initialVariables = {}) {
        const workflow = await this.prisma.workflow.findUnique({
            where: { id: workflowId },
            include: { versions: { where: { status: 'published' }, take: 1, orderBy: { versionNumber: 'desc' } } }
        });
        if (!workflow || workflow.versions.length === 0) {
            throw new Error('Published workflow not found');
        }
        const version = workflow.versions[0];
        const graph = version.graph;
        const triggerNode = graph.nodes?.find((n) => n.type === 'trigger');
        if (!triggerNode) {
            throw new Error('Workflow has no trigger node');
        }
        const instance = await this.prisma.workflowInstance.create({
            data: {
                shopId,
                workflowId,
                workflowVersionId: version.id,
                contactId,
                status: 'active',
                variables: initialVariables,
                currentNodeId: triggerNode.id,
            }
        });
        await this.prisma.workflowAnalytics.upsert({
            where: { workflowId },
            create: { workflowId, shopId, totalStarted: 1 },
            update: { totalStarted: { increment: 1 } }
        });
        await this.enqueueNodeExecution(instance.id, triggerNode.id);
        return instance;
    }
    async enqueueNodeExecution(instanceId, nodeId, delayMs = 0) {
        const instance = await this.prisma.workflowInstance.findUnique({ where: { id: instanceId } });
        if (!instance)
            return;
        const jobRecord = await this.prisma.workflowJob.create({
            data: {
                shopId: instance.shopId,
                workflowId: instance.workflowId,
                instanceId,
                nodeId,
                status: 'pending',
                idempotencyKey: (0, uuid_1.v4)(),
            }
        });
        await this.executionQueue.add('execute-node', { jobId: jobRecord.id, instanceId, nodeId }, { delay: delayMs, jobId: jobRecord.id });
    }
    async processNode(jobId, instanceId, nodeId) {
        const instance = await this.prisma.workflowInstance.findUnique({
            where: { id: instanceId },
            include: { version: true }
        });
        if (!instance || instance.status === 'cancelled' || instance.status === 'completed') {
            return;
        }
        const graph = instance.version.graph;
        const nodeData = graph.nodes?.find((n) => n.id === nodeId);
        if (!nodeData) {
            throw new Error(`Node ${nodeId} not found in graph`);
        }
        const executor = this.nodeRegistry.get(nodeData.type);
        if (!executor) {
            throw new Error(`Executor not found for type ${nodeData.type}`);
        }
        const context = {
            instanceId,
            shopId: instance.shopId,
            workflowId: instance.workflowId,
            contactId: instance.contactId,
            variables: instance.variables,
            getNodeData: (id) => graph.nodes?.find((n) => n.id === id)
        };
        const startTime = Date.now();
        let result;
        try {
            result = await executor.execute(context, nodeData.data);
            await this.prisma.workflowExecutionLog.create({
                data: {
                    instanceId,
                    nodeId,
                    status: result.status === 'error' ? 'error' : 'success',
                    startedAt: new Date(startTime),
                    completedAt: new Date(),
                    durationMs: Date.now() - startTime,
                    error: result.error
                }
            });
        }
        catch (e) {
            result = { status: 'error', error: e.message };
            await this.prisma.workflowExecutionLog.create({
                data: { instanceId, nodeId, status: 'error', startedAt: new Date(startTime), completedAt: new Date(), durationMs: Date.now() - startTime, error: e.message }
            });
        }
        await this.handleExecutionResult(instance, nodeId, result, graph);
    }
    async handleExecutionResult(instance, nodeId, result, graph) {
        if (result.status === 'error') {
            await this.prisma.workflowInstance.update({
                where: { id: instance.id },
                data: { status: 'failed' }
            });
            return;
        }
        if (result.status === 'wait') {
            await this.prisma.workflowInstance.update({
                where: { id: instance.id },
                data: { status: 'waiting', resumeToken: result.resumeToken }
            });
            return;
        }
        if (result.status === 'pause' && result.delayMs) {
            await this.prisma.workflowInstance.update({
                where: { id: instance.id },
                data: { status: 'paused', currentNodeId: nodeId }
            });
            const edges = graph.edges?.filter((e) => e.source === nodeId) || [];
            for (const edge of edges) {
                await this.enqueueNodeExecution(instance.id, edge.target, result.delayMs);
            }
            return;
        }
        if (result.status === 'stop') {
            await this.prisma.workflowInstance.update({
                where: { id: instance.id },
                data: { status: 'completed', completionTime: new Date() }
            });
            return;
        }
        let edges = graph.edges?.filter((e) => e.source === nodeId) || [];
        if (result.branch) {
            edges = edges.filter((e) => e.sourceHandle === result.branch);
        }
        if (edges.length === 0) {
            await this.prisma.workflowInstance.update({
                where: { id: instance.id },
                data: { status: 'completed', completionTime: new Date() }
            });
        }
        else {
            await this.prisma.workflowInstance.update({
                where: { id: instance.id },
                data: {
                    previousNodeId: nodeId,
                    lastExecutedNodeId: nodeId,
                    executionVersion: { increment: 1 }
                }
            });
            for (const edge of edges) {
                await this.enqueueNodeExecution(instance.id, edge.target);
            }
        }
    }
};
exports.WorkflowEngineService = WorkflowEngineService;
exports.WorkflowEngineService = WorkflowEngineService = WorkflowEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bullmq_1.InjectQueue)('workflow-execution-queue')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        node_executor_registry_1.NodeExecutorRegistry,
        expression_engine_service_1.ExpressionEngineService,
        bullmq_2.Queue])
], WorkflowEngineService);
//# sourceMappingURL=workflow-engine.service.js.map