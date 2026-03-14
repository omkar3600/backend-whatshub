import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
export class CampaignsController {
    constructor(private readonly campaignsService: CampaignsService) { }

    @Post()
    async createCampaign(@GetUser() user: any, @Body() body: any) {
        return this.campaignsService.createCampaign(user.shopId, body);
    }

    @Get()
    async getCampaigns(@GetUser() user: any) {
        return this.campaignsService.getCampaigns(user.shopId);
    }

    @Post(':id/resend-failed')
    async resendFailed(@GetUser() user: any, @Param('id') id: string) {
        return this.campaignsService.resendFailed(user.shopId, id);
    }
}
