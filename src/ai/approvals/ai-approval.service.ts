import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ToolRegistry } from '../tools/registry/tool.registry';
import { ToolContext } from '../tools/tool.interface';

@Injectable()
export class AiApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly toolRegistry: ToolRegistry,
  ) {}

  async getPendingActions(shopId: string) {
    if (!shopId) return [];
    await this.prisma.aiAction.updateMany({
      where: { shopId, status: 'pending', expiresAt: { lt: new Date() } },
      data: { status: 'expired' },
    });
    return this.prisma.aiAction.findMany({
      where: { shopId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { contact: { select: { name: true, phone: true } } },
    });
  }

  async approveAction(actionId: string, shopId: string, userId: string) {
    const action = await this.prisma.aiAction.findFirst({ where: { id: actionId, shopId } });
    if (!action) throw new NotFoundException('Action not found');
    if (action.status !== 'pending') throw new ForbiddenException('Action is no longer pending');

    const tool = this.toolRegistry.get(action.toolName);
    if (!tool) throw new NotFoundException(`Tool ${action.toolName} not found`);

    const ctx: ToolContext = { shopId, contactId: action.contactId || undefined };
    const result = await tool.execute(ctx, action.toolInput);

    await this.prisma.aiAction.update({
      where: { id: actionId },
      data: {
        status: result.success ? 'executed' : 'rejected',
        result: result.data || null,
        errorMessage: result.error || null,
        approvedBy: userId,
        reviewedAt: new Date(),
      },
    });

    return { success: result.success, data: result.data, error: result.error };
  }

  async rejectAction(actionId: string, shopId: string, userId: string) {
    const action = await this.prisma.aiAction.findFirst({ where: { id: actionId, shopId } });
    if (!action) throw new NotFoundException('Action not found');
    await this.prisma.aiAction.update({
      where: { id: actionId },
      data: { status: 'rejected', approvedBy: userId, reviewedAt: new Date() },
    });
    return { success: true };
  }
}
