import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { SequencesService } from './sequences.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sequences')
@UseGuards(JwtAuthGuard)
export class SequencesController {
    constructor(private readonly sequencesService: SequencesService) {}

    @Post()
    async create(@Request() req, @Body() data: { name: string; triggerTag: string; steps: any[] }) {
        return this.sequencesService.createSequence(req.user.shopId, data);
    }

    @Get()
    async findAll(@Request() req) {
        return this.sequencesService.getSequences(req.user.shopId);
    }

    @Put(':id/toggle')
    async toggle(@Request() req, @Param('id') id: string, @Body() data: { isActive: boolean }) {
        return this.sequencesService.toggleSequence(req.user.shopId, id, data.isActive);
    }

    @Delete(':id')
    async delete(@Request() req, @Param('id') id: string) {
        return this.sequencesService.deleteSequence(req.user.shopId, id);
    }
}
