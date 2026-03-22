import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class FlowsService {
    constructor(private prisma: PrismaService) { }

    async createFlow(shopId: string, data: any) {
        return this.prisma.flow.create({
            data: {
                shopId,
                name: data.name,
                description: data.description,
                category: data.category || 'Custom',
                status: data.status || 'Draft',
                nodeCount: data.nodeCount || 1,
                nodes: data.nodes || [],
                edges: data.edges || []
            },
        });
    }

    async getFlows(shopId: string) {
        return this.prisma.flow.findMany({
            where: { shopId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getFlow(shopId: string, id: string) {
        const flow = await this.prisma.flow.findFirst({
            where: { id, shopId },
        });
        if (!flow) throw new NotFoundException('Flow not found');
        return flow;
    }

    async updateFlow(shopId: string, id: string, data: any) {
        const existing = await this.prisma.flow.findFirst({ where: { id, shopId } });
        if (!existing) throw new NotFoundException('Flow not found');
        
        // Create a version snapshot before updating
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
                edges: data.edges
            },
        });
    }

    async getFlowVersions(shopId: string, flowId: string) {
        const flow = await this.prisma.flow.findFirst({ where: { id: flowId, shopId } });
        if (!flow) throw new NotFoundException('Flow not found');

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

    async getFlowVersion(shopId: string, flowId: string, versionId: string) {
        const version = await this.prisma.flowVersion.findFirst({
            where: { id: versionId, flowId },
        });
        if (!version) throw new NotFoundException('Version not found');
        return version;
    }

    async deleteFlow(shopId: string, id: string) {
        const existing = await this.prisma.flow.findFirst({ where: { id, shopId } });
        if (!existing) throw new NotFoundException('Flow not found');
        
        await this.prisma.flow.delete({ where: { id } });
        return { message: 'Flow deleted' };
    }

    async getFlowAnalytics(shopId: string, flowId: string) {
        const flow = await this.prisma.flow.findFirst({ where: { id: flowId, shopId } });
        if (!flow) throw new NotFoundException('Flow not found');

        const analytics = await this.prisma.flowAnalytics.findMany({
            where: { flowId },
        });

        return analytics.reduce((acc, curr) => {
            acc[curr.nodeId] = curr.hits;
            return acc;
        }, {});
    }

    async simulateFlow(id: string, data: any) {
        try {
            const response = await axios.post(`http://localhost:8080/api/chatbot/simulate/${id}`, {
                input: data.input,
                nodes: data.nodes,
                edges: data.edges
            });
            return response.data;
        } catch (error) {
            console.error('Simulation proxy failed:', error.message);
            throw new Error('Chatbot engine unavailable for simulation');
        }
    }
}
