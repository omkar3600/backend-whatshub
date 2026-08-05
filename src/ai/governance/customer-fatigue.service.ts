import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface FatigueCheckResult {
  canContact: boolean;
  fatigueScore: number; // 0-100
  reason?: string;
}

@Injectable()
export class CustomerFatigueService {
  private readonly logger = new Logger(CustomerFatigueService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkFatigue(shopId: string, contactId: string): Promise<FatigueCheckResult> {
    const now = new Date();
    const currentHour = now.getHours();

    // 1. Quiet Hours Check (10 PM to 8 AM)
    if (currentHour >= 22 || currentHour < 8) {
      return {
        canContact: false,
        fatigueScore: 90,
        reason: 'Quiet hours policy active (10 PM - 8 AM). Proactive messages blocked.',
      };
    }

    // 2. Count messages sent to this contact in the last 24h
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const messagesCount = await this.prisma.message.count({
      where: {
        shopId,
        direction: 'outbound',
        timestamp: { gte: dayAgo },
        conversation: { contactId },
      },
    });

    // 3. Max daily message limit (Max 3 proactive messages/day)
    if (messagesCount >= 3) {
      return {
        canContact: false,
        fatigueScore: 85,
        reason: `Customer reached daily message limit (${messagesCount}/3).`,
      };
    }

    // 4. Calculate fatigue score
    const fatigueScore = Math.min(messagesCount * 25, 100);

    return {
      canContact: true,
      fatigueScore,
    };
  }
}
