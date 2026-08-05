import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
}

@Injectable()
export class AiPolicyEngineService {
  private readonly logger = new Logger(AiPolicyEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async evaluateToolCall(
    shopId: string,
    toolName: string,
    params: any,
    autonomyLevel: number = 2
  ): Promise<PolicyEvaluationResult> {
    // 1. Level 1 Autonomy = Read-only (Block all write / sensitive tools)
    const writeTools = ['create_order', 'apply_coupon', 'send_campaign', 'update_lead_stage'];
    if (autonomyLevel <= 1 && writeTools.includes(toolName)) {
      return {
        allowed: false,
        reason: 'Shop autonomy level 1 requires explicit manual approval for write tools.',
        requiresApproval: true,
      };
    }

    // 2. Max discount limit policy (e.g. max 20% discount)
    if (toolName === 'apply_coupon' && params?.discountPercentage > 20) {
      return {
        allowed: false,
        reason: 'Policy Violation: AI discount cannot exceed 20%.',
        requiresApproval: true,
      };
    }

    // 3. High-value order threshold (orders over 10,000 require approval)
    if (toolName === 'create_order' && params?.totalAmount > 10000) {
      return {
        allowed: true,
        requiresApproval: true,
        reason: 'High-value order requires human manager sign-off.',
      };
    }

    return { allowed: true };
  }
}
