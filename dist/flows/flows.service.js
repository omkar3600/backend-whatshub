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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const flow_engine_service_1 = require("./flow-engine.service");
let FlowsService = class FlowsService {
    prisma;
    flowEngine;
    constructor(prisma, flowEngine) {
        this.prisma = prisma;
        this.flowEngine = flowEngine;
    }
    async createFlow(shopId, data) {
        return this.prisma.flow.create({
            data: {
                shopId,
                name: data.name,
                description: data.description,
                category: data.category || 'Custom',
                status: data.status || 'Draft',
                nodeCount: data.nodeCount || 1,
                nodes: data.nodes || [],
                edges: data.edges || [],
                triggerKeyword: data.triggerKeyword,
                isDefault: data.isDefault || false
            },
        });
    }
    async getFlows(shopId) {
        return this.prisma.flow.findMany({
            where: { shopId },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async getFlow(shopId, id) {
        const flow = await this.prisma.flow.findFirst({
            where: { id, shopId },
        });
        if (!flow)
            throw new common_1.NotFoundException('Flow not found');
        return flow;
    }
    async updateFlow(shopId, id, data) {
        const existing = await this.prisma.flow.findFirst({ where: { id, shopId } });
        if (!existing)
            throw new common_1.NotFoundException('Flow not found');
        const versionCount = await this.prisma.flowVersion.count({ where: { flowId: id } });
        await this.prisma.flowVersion.create({
            data: {
                flowId: id,
                versionNumber: versionCount + 1,
                name: `Version ${versionCount + 1} (${new Date().toLocaleString()})`,
                nodes: existing.nodes || [],
                edges: existing.edges || []
            }
        });
        return this.prisma.flow.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                status: data.status,
                nodeCount: data.nodeCount,
                nodes: data.nodes,
                edges: data.edges,
                triggerKeyword: data.triggerKeyword,
                isDefault: data.isDefault
            },
        });
    }
    async getFlowVersions(shopId, flowId) {
        const flow = await this.prisma.flow.findFirst({ where: { id: flowId, shopId } });
        if (!flow)
            throw new common_1.NotFoundException('Flow not found');
        return this.prisma.flowVersion.findMany({
            where: { flowId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                versionNumber: true,
                name: true,
                createdAt: true
            }
        });
    }
    async getFlowVersion(shopId, flowId, versionId) {
        const version = await this.prisma.flowVersion.findFirst({
            where: { id: versionId, flowId },
        });
        if (!version)
            throw new common_1.NotFoundException('Version not found');
        return version;
    }
    async deleteFlow(shopId, id) {
        const existing = await this.prisma.flow.findFirst({ where: { id, shopId } });
        if (!existing)
            throw new common_1.NotFoundException('Flow not found');
        await this.prisma.flowSession.deleteMany({ where: { flowId: id } });
        await this.prisma.flow.delete({ where: { id } });
        return { message: 'Flow deleted' };
    }
    async updateSettings(shopId, id, data) {
        if (data.isDefault) {
            await this.prisma.flow.updateMany({
                where: { shopId, isDefault: true },
                data: { isDefault: false }
            });
        }
        return this.prisma.flow.update({
            where: { id, shopId },
            data: {
                triggerKeyword: data.triggerKeyword,
                isDefault: data.isDefault,
                status: data.status,
                name: data.name
            }
        });
    }
    async getFlowAnalytics(shopId, flowId) {
        const flow = await this.prisma.flow.findFirst({ where: { id: flowId, shopId } });
        if (!flow)
            throw new common_1.NotFoundException('Flow not found');
        const analytics = await this.prisma.flowAnalytics.findMany({
            where: { flowId },
        });
        return analytics.reduce((acc, curr) => {
            acc[curr.nodeId] = curr.hits;
            return acc;
        }, {});
    }
    async simulateFlow(id, data) {
        try {
            const definition = {
                nodes: data.nodes || [],
                edges: data.edges || []
            };
            return await this.flowEngine.processSimulation(id, data.input, definition);
        }
        catch (error) {
            console.error('Simulation failed:', error.message);
            throw new Error('Internal Flow Engine Error');
        }
    }
};
exports.FlowsService = FlowsService;
exports.FlowsService = FlowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        flow_engine_service_1.FlowEngineService])
], FlowsService);
//# sourceMappingURL=flows.service.js.map