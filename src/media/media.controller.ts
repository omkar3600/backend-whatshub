import { Controller, Post, Get, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { Express } from 'express';

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user', 'admin') // Both might upload, generally shop owner
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@GetUser() user: any, @UploadedFile() file: Express.Multer.File) {
        return this.mediaService.uploadFile(user.shopId, file);
    }

    @Get()
    async getMediaFiles(@GetUser() user: any) {
        return this.mediaService.getMediaFiles(user.shopId);
    }
}
