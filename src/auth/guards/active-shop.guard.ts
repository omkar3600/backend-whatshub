import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_SHOP_STATUS_KEY } from '../decorators/bypass-shop-status.decorator';

@Injectable()
export class ActiveShopGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if route has @BypassShopStatus()
        const isBypassed = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_SHOP_STATUS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isBypassed) {
            return true;
        }

        const req = context.switchToHttp().getRequest();
        const user = req.user;

        // If no user is attached yet (public route) or admin, allow it
        if (!user || user.role === 'admin') {
            return true;
        }

        // Fetch shop & subscription details
        const shop = await this.prisma.shop.findUnique({
            where: { ownerId: user.id },
            include: { subscription: true }
        });

        if (shop) {
            if (shop.status !== 'active') {
                throw new ForbiddenException({
                    code: 'ACCOUNT_SUSPENDED',
                    message: 'Your account has been temporarily seized. Contact administrator for more.'
                });
            }

            if (shop.subscription && new Date(shop.subscription.expiryDate) < new Date()) {
                throw new ForbiddenException({
                    code: 'SUBSCRIPTION_EXPIRED',
                    message: 'Your subscription date is over.'
                });
            }
        }

        return true;
    }
}
