import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface OpportunityItem {
  id: string;
  type: 'HOT_LEAD' | 'ABANDONED_CART' | 'UPSELL' | 'AT_RISK' | 'HUMAN_ESCALATION';
  score: number; // 0-100
  title: string;
  reason: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  estimatedValue: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedAction: string;
  createdAt: string;
}

@Injectable()
export class OpportunityDetectionService {
  private readonly logger = new Logger(OpportunityDetectionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async detectOpportunities(shopId: string): Promise<OpportunityItem[]> {
    const opportunities: OpportunityItem[] = [];

    // 1. High-value / Hot Leads (leadScore >= 70)
    const hotLeads = await this.prisma.aiLeadScore.findMany({
      where: { shopId, score: { gte: 70 } },
      include: { contact: true },
      take: 10,
    });

    for (const lead of hotLeads) {
      if (!lead.contact) continue;
      opportunities.push({
        id: `opp_lead_${lead.id.slice(0, 8)}`,
        type: 'HOT_LEAD',
        score: lead.score,
        title: `🔥 High-Intent Lead: ${lead.contact.name}`,
        reason: `High lead score (${lead.score}/100) at stage '${lead.stage}'. Inferred intent: ${lead.intent || 'High purchase interest'}.`,
        contactId: lead.contact.id,
        contactName: lead.contact.name,
        contactPhone: lead.contact.phone,
        estimatedValue: 4500,
        urgency: lead.score >= 85 ? 'CRITICAL' : 'HIGH',
        recommendedAction: 'Trigger product catalogue or discount offer via AI Agent',
        createdAt: lead.updatedAt.toISOString(),
      });
    }

    // 2. Pending Actions requiring approval
    const pendingActions = await this.prisma.aiAction.findMany({
      where: { shopId, status: 'pending' },
      include: { contact: true },
      take: 10,
    });

    for (const action of pendingActions) {
      opportunities.push({
        id: `opp_action_${action.id.slice(0, 8)}`,
        type: 'HUMAN_ESCALATION',
        score: action.riskLevel === 'CRITICAL' ? 95 : 80,
        title: `⚠️ Action Pending Review: ${action.toolName}`,
        reason: action.rationale || `AI requested tool execution requiring business sign-off`,
        contactId: action.contactId || '',
        contactName: action.contact?.name || 'Customer',
        contactPhone: action.contact?.phone || 'N/A',
        estimatedValue: 2500,
        urgency: action.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'MEDIUM',
        recommendedAction: `Approve or reject action '${action.toolName}'`,
        createdAt: action.createdAt.toISOString(),
      });
    }

    // 3. Follow-up engine items
    const followUps = await this.prisma.aiFollowUp.findMany({
      where: { shopId, status: 'pending' },
      include: { contact: true },
      take: 10,
    });

    for (const fu of followUps) {
      if (!fu.contact) continue;
      opportunities.push({
        id: `opp_fu_${fu.id.slice(0, 8)}`,
        type: fu.reason.includes('cart') ? 'ABANDONED_CART' : 'UPSELL',
        score: 75,
        title: `🛒 Re-engagement Opportunity: ${fu.contact.name}`,
        reason: `Scheduled follow-up reason: '${fu.reason}' scheduled at ${fu.scheduledAt.toLocaleDateString()}`,
        contactId: fu.contact.id,
        contactName: fu.contact.name,
        contactPhone: fu.contact.phone,
        estimatedValue: 1800,
        urgency: 'MEDIUM',
        recommendedAction: 'Send automated WhatsApp follow-up template',
        createdAt: fu.createdAt.toISOString(),
      });
    }

    return opportunities.sort((a, b) => b.score - a.score);
  }
}
