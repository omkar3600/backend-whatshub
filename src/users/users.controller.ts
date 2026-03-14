import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getProfile(@GetUser() user: any) {
        return this.usersService.getProfile(user.id);
    }

    @Put('me')
    async updateProfile(@GetUser() user: any, @Body() body: any) {
        return this.usersService.updateProfile(user.id, body);
    }

    @Put('me/password')
    async changePassword(@GetUser() user: any, @Body() body: any) {
        return this.usersService.changePassword(user.id, body);
    }
}
