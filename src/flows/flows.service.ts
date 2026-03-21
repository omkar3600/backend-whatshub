import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

    async deleteFlow(shopId: string, id: string) {
        const existing = await this.prisma.flow.findFirst({ where: { id, shopId } });
        if (!existing) throw new NotFoundException('Flow not found');
        
        await this.prisma.flow.delete({ where: { id } });
        return { message: 'Flow deleted' };
    }
}
