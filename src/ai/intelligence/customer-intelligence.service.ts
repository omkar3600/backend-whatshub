import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CustomerIntelligenceProfile {
  contactId: string;
  name: string;
  phone: string;
  city?: string | null;
  segment?: string | null;
  leadStage?: string | null;
  leadScore: number;
  preferences: Record<string, any>;
  purchaseHistory: any[];
  interactionsCount: number;
  lastInteractionAt?: Date | null;
  topInterests: string[];
  lifecycleStage: string;
}

@Injectable()
export class CustomerIntelligenceService {
  private readonly logger = new Logger(CustomerIntelligenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(shopId: string, contactId: string): Promise<CustomerIntelligenceProfile | null> {
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        aiMemory: true,
        aiLeadScore: true,
        conversations: { take: 1, orderBy: { updatedAt: 'desc' } },
      },
    });

    if (!contact || contact.shopId !== shopId) return null;

    const memory = contact.aiMemory;
    const score = contact.aiLeadScore?.score || 0;
    const preferences = (memory?.preferences as Record<string, any>) || {};
    const purchaseHistory = (memory?.purchaseHistory as any[]) || [];
    const interests = (preferences.interests as string[]) || [];

    let lifecycleStage = 'NEW';
    if (purchaseHistory.length > 0) lifecycleStage = 'RETURNING_CUSTOMER';
    else if (score >= 80) lifecycleStage = 'HOT_LEAD';
    else if (score >= 50) lifecycleStage = 'QUALIFIED_LEAD';

    return {
      contactId: contact.id,
      name: contact.name,
      phone: contact.phone,
      city: contact.city,
      segment: contact.aiSegment,
      leadStage: contact.aiLeadStage || 'NEW',
      leadScore: score,
      preferences,
      purchaseHistory,
      interactionsCount: contact.conversations.length,
      lastInteractionAt: contact.lastAiInteractionAt,
      topInterests: interests,
      lifecycleStage,
    };
  }
}
