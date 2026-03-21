import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
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

    @Put(':id')
    async updateFlow(@GetUser() user: any, @Param('id') id: string, @Body() body: any) {
        return this.flowsService.updateFlow(user.shopId, id, body);
    }

    @Delete(':id')
    async deleteFlow(@GetUser() user: any, @Param('id') id: string) {
        return this.flowsService.deleteFlow(user.shopId, id);
    }
}
