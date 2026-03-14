import { Controller, Post, Body } from '@nestjs/common';
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
    async login(@Body() body: any) {
        return this.authService.login(body);
    }
}
