import { Injectable } from '@nestjs/common';
import { CustomerIntelligenceService } from './customer-intelligence.service';

export interface NextBestAction {
  contactId: string;
  action: string;
  confidence: number; // 0-100
  rationale: string;
  recommendedTool?: string;
  toolParams?: Record<string, any>;
}

@Injectable()
export class NextBestActionEngine {
  constructor(private readonly customerIntelligence: CustomerIntelligenceService) {}

  async predict(shopId: string, contactId: string): Promise<NextBestAction> {
    const profile = await this.customerIntelligence.getProfile(shopId, contactId);

    if (!profile) {
      return {
        contactId,
        action: 'SEND_GREETING',
        confidence: 60,
        rationale: 'New customer without historical profile data.',
        recommendedTool: 'send_text_message',
      };
    }

    if (profile.leadScore >= 80 && profile.leadStage === 'PAYMENT_PENDING') {
      return {
        contactId,
        action: 'SEND_PAYMENT_REMINDER',
        confidence: 94,
        rationale: `Customer ${profile.name} has high purchase intent (score ${profile.leadScore}) with payment pending.`,
        recommendedTool: 'send_text_message',
        toolParams: { message: `Hi ${profile.name}, your order checkout is ready! Let us know if you need help finalizing payment.` },
      };
    }

    if (profile.topInterests.length > 0 && profile.purchaseHistory.length === 0) {
      return {
        contactId,
        action: 'RECOMMEND_INTEREST_PRODUCT',
        confidence: 88,
        rationale: `Customer interested in ${profile.topInterests.join(', ')} but has not purchased yet.`,
        recommendedTool: 'search_products',
        toolParams: { query: profile.topInterests[0] },
      };
    }

    if (profile.lifecycleStage === 'RETURNING_CUSTOMER') {
      return {
        contactId,
        action: 'OFFER_VIP_DISCOUNT',
        confidence: 82,
        rationale: `Returning customer with ${profile.purchaseHistory.length} past purchases.`,
        recommendedTool: 'send_interactive_buttons',
      };
    }

    return {
      contactId,
      action: 'QUALIFY_LEAD_REQUIREMENTS',
      confidence: 75,
      rationale: 'Moderate intent customer. Recommend asking for budget and timeline.',
      recommendedTool: 'send_text_message',
    };
  }
}
