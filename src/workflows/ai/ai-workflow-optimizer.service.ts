import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface OptimizationRecommendation {
  workflowId: string;
  bottleneckNodeId?: string;
  dropOffRate: number;
  recommendation: string;
  proposedVariantGraph?: any;
}

@Injectable()
export class AiWorkflowOptimizerService {
  constructor(private readonly prisma: PrismaService) {}

  async analyzeAndOptimize(workflowId: string): Promise<OptimizationRecommendation> {
    const analytics = await this.prisma.workflowAnalytics.findUnique({
      where: { workflowId },
    });

    const totalStarted = analytics?.totalStarted || 1;
    const totalCompleted = analytics?.totalCompleted || 0;

    const completionRate = Math.round((totalCompleted / totalStarted) * 100);
    const dropOffRate = 100 - completionRate;

    return {
      workflowId,
      dropOffRate,
      recommendation: dropOffRate > 25
        ? `Observed ${dropOffRate}% drop-off. Recommend replacing plain text replies with interactive product buttons or reducing delay nodes.`
        : 'Workflow performing optimally with high completion rate.',
    };
  }
}
