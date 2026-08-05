import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface NegotiationResult {
  permitted: boolean;
  approvedDiscountPercentage: number;
  reason: string;
}

@Injectable()
export class NegotiationEngineService {
  private readonly logger = new Logger(NegotiationEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async evaluateDiscount(
    shopId: string,
    contactId: string,
    requestedDiscountPercentage: number,
    productPrice: number,
  ): Promise<NegotiationResult> {
    // 1. Hard server-side maximum discount policy (Max 10% auto discount)
    const MAX_AUTO_DISCOUNT = 10;

    // Check contact VIP tag
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
    const tags = (contact?.tags as string[]) || [];
    const isVip = tags.includes('VIP');

    const maxAllowed = isVip ? 15 : MAX_AUTO_DISCOUNT;

    if (requestedDiscountPercentage > maxAllowed) {
      return {
        permitted: false,
        approvedDiscountPercentage: maxAllowed,
        reason: `Requested discount (${requestedDiscountPercentage}%) exceeds policy limit (${maxAllowed}%). Counter-offer capped at ${maxAllowed}%.`,
      };
    }

    return {
      permitted: true,
      approvedDiscountPercentage: requestedDiscountPercentage,
      reason: `Discount of ${requestedDiscountPercentage}% is within approved policy bounds.`,
    };
  }
}
