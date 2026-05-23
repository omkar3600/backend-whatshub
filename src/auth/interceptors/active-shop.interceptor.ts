import { CallHandler, ExecutionContext, Injectable, NestInterceptor, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_SHOP_STATUS_KEY } from '../decorators/bypass-shop-status.decorator';

@Injectable()
export class ActiveShopInterceptor implements NestInterceptor {
    constructor(private reflector: Reflector) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // Check if route has @BypassShopStatus()
        const isBypassed = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_SHOP_STATUS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isBypassed) {
            return next.handle();
        }

        const req = context.switchToHttp().getRequest();
        const user = req.user;

        // DEBUG LOGGING
        const fs = require('fs');
        fs.appendFileSync('interceptor-debug.log', JSON.stringify({ 
            time: new Date(), 
            url: req.url, 
            user: user 
        }) + '\n');

        // User is populated here because interceptors run AFTER guards
        if (user && user.role !== 'admin') {
            if (user.shopStatus && user.shopStatus !== 'active') {
                throw new ForbiddenException({
                    code: 'ACCOUNT_SUSPENDED',
                    message: 'Your account has been temporarily seized. Contact administrator for more.'
                });
            }

            if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
                throw new ForbiddenException({
                    code: 'SUBSCRIPTION_EXPIRED',
                    message: 'Your subscription date is over.'
                });
            }
        }

        return next.handle();
    }
}
