import { Controller, Post, Get, Put, Body, Param, UseGuards, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Post('shops')
    async createShop(@Body() body: any) {
        return this.adminService.createShop(body);
    }

    @Get('shops')
    async getShops() {
        return this.adminService.getShops();
    }

    @Put('shops/:shopId/subscription')
    async updateSubscription(@Param('shopId') shopId: string, @Body() body: any) {
        return this.adminService.updateSubscription(shopId, body);
    }

    @Put('shops/:shopId')
    async updateShop(@Param('shopId') shopId: string, @Body() body: any) {
        return this.adminService.updateShop(shopId, body);
    }

    @Put('shops/:shopId/status')
    async toggleShopStatus(@Param('shopId') shopId: string, @Body() body: any) {
        return this.adminService.toggleShopStatus(shopId, body.status);
    }

    @Delete('shops/:shopId')
    async deleteShop(@Param('shopId') shopId: string) {
        return this.adminService.deleteShop(shopId);
    }

    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('requests')
    async getRegistrationRequests() {
        return this.adminService.getRegistrationRequests();
    }

    @Post('requests/:id/approve')
    async approveRequest(@Param('id') id: string) {
        return this.adminService.approveRegistrationRequest(id);
    }

    @Post('requests/:id/reject')
    async rejectRequest(@Param('id') id: string) {
        return this.adminService.rejectRegistrationRequest(id);
    }
}
