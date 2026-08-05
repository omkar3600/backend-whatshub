import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface GovernanceOverview {
  shopId: string;
  autonomyLevel: number;
  maxIterationsLimit: number;
  totalAuditLogs: number;
  successfulToolExecutions: number;
  pendingApprovals: number;
  estimatedDailyCost: number;
  allowedTools: string[];
}

@Injectable()
export class AiGovernanceService {
  private readonly logger = new Logger(AiGovernanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOverview(shopId: string): Promise<GovernanceOverview> {
    const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
    
    const [totalAuditLogs, successfulLogs, pendingActions] = await Promise.all([
      this.prisma.aiAuditLog.count({ where: { shopId } }),
      this.prisma.aiAuditLog.count({ where: { shopId, success: true } }),
      this.prisma.aiAction.count({ where: { shopId, status: 'pending' } }),
    ]);

    const estimatedDailyCost = Math.round((totalAuditLogs * 0.002) * 100) / 100; // estimated token cost

    return {
      shopId,
      autonomyLevel: config?.autonomyLevel ?? 2,
      maxIterationsLimit: config?.maxIterations ?? 8,
      totalAuditLogs,
      successfulToolExecutions: successfulLogs,
      pendingApprovals: pendingActions,
      estimatedDailyCost,
      allowedTools: (config?.allowedTools as string[]) || [],
    };
  }

  async setAutonomyLevel(shopId: string, level: number): Promise<void> {
    await this.prisma.chatbotConfig.upsert({
      where: { shopId },
      create: { shopId, autonomyLevel: level },
      update: { autonomyLevel: level },
    });
  }
}
