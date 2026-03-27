import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { FlowsService } from './flows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('flows')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
export class FlowsController {
    constructor(private readonly flowsService: FlowsService) { }

    @Post()
    async createFlow(@GetUser() user: any, @Body() body: any) {
        return this.flowsService.createFlow(user.shopId, body);
    }

    @Get()
    async getFlows(@GetUser() user: any) {
        return this.flowsService.getFlows(user.shopId);
    }

    @Get(':id')
    async getFlow(@GetUser() user: any, @Param('id') id: string) {
        return this.flowsService.getFlow(user.shopId, id);
    }

    @Get(':id/analytics')
    async getFlowAnalytics(@GetUser() user: any, @Param('id') id: string) {
        return this.flowsService.getFlowAnalytics(user.shopId, id);
    }

    @Get(':id/versions')
    async getFlowVersions(@GetUser() user: any, @Param('id') id: string) {
        return this.flowsService.getFlowVersions(user.shopId, id);
    }

    @Get(':id/versions/:versionId')
    async getFlowVersion(@GetUser() user: any, @Param('id') id: string, @Param('versionId') versionId: string) {
        return this.flowsService.getFlowVersion(user.shopId, id, versionId);
    }

    @Post(':id/simulate')
    async simulateFlow(@Param('id') id: string, @Body() body: any) {
        return this.flowsService.simulateFlow(id, body);
    }

    @Put(':id')
    async updateFlow(@GetUser() user: any, @Param('id') id: string, @Body() body: any) {
        return this.flowsService.updateFlow(user.shopId, id, body);
    }

    @Delete(':id')
    async deleteFlow(@GetUser() user: any, @Param('id') id: string) {
        return this.flowsService.deleteFlow(user.shopId, id);
    }

    @Patch(':id/settings')
    async updateSettings(@GetUser() user: any, @Param('id') id: string, @Body() body: any) {
        return this.flowsService.updateSettings(user.shopId, id, body);
    }
}
