import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AiApprovalService } from './ai-approval.service';

@Controller('ai/actions')
@UseGuards(JwtAuthGuard)
export class AiApprovalController {
  constructor(private readonly approvalService: AiApprovalService) {}

  @Get('pending')
  getPending(@Request() req: any) {
    return this.approvalService.getPendingActions(req.user.shopId);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.approvalService.approveAction(id, req.user.shopId, req.user.sub);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Request() req: any) {
    return this.approvalService.rejectAction(id, req.user.shopId, req.user.sub);
  }
}
