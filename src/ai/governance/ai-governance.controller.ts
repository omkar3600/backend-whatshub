import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AiGovernanceService } from './ai-governance.service';

@Controller('ai/governance')
@UseGuards(JwtAuthGuard)
export class AiGovernanceController {
  constructor(private readonly governance: AiGovernanceService) {}

  @Get('overview')
  async getOverview(@Request() req: any) {
    return this.governance.getOverview(req.user.shopId);
  }

  @Post('autonomy')
  async setAutonomy(@Request() req: any, @Body('autonomyLevel') autonomyLevel: number) {
    await this.governance.setAutonomyLevel(req.user.shopId, autonomyLevel);
    return { success: true, autonomyLevel };
  }
}
