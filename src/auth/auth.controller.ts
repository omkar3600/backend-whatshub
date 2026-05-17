import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register-interest')
    async registerInterest(@Body() body: any) {
        return this.authService.registerInterest(body);
    }

    @Post('register')
    async register(@Body() body: any) {
        return this.authService.registerShop(body);
    }

    @Post('login')
    async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(body);
        res.cookie('token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return result;
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('token');
        return { message: 'Logged out successfully' };
    }
}
