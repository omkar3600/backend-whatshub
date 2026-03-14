import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) { }

    @Post()
    async createTemplate(@GetUser() user: any, @Body() body: any) {
        return this.templatesService.createTemplate(user.shopId, body);
    }

    @Get()
    async getTemplates(@GetUser() user: any) {
        return this.templatesService.getTemplates(user.shopId);
    }

    @Delete(':id')
    async deleteTemplate(@GetUser() user: any, @Param('id') id: string) {
        return this.templatesService.deleteTemplate(user.shopId, id);
    }

    @Post('sync')
    async syncTemplates(@GetUser() user: any) {
        return this.templatesService.syncTemplates(user.shopId);
    }
}
