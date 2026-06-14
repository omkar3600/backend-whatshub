"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveShopInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const bypass_shop_status_decorator_1 = require("../decorators/bypass-shop-status.decorator");
let ActiveShopInterceptor = class ActiveShopInterceptor {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        const isBypassed = this.reflector.getAllAndOverride(bypass_shop_status_decorator_1.IS_PUBLIC_SHOP_STATUS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isBypassed) {
            return next.handle();
        }
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const fs = require('fs');
        fs.appendFileSync('interceptor-debug.log', JSON.stringify({
            time: new Date(),
            url: req.url,
            user: user
        }) + '\n');
        if (user && user.role !== 'admin') {
            if (user.shopStatus && user.shopStatus !== 'active') {
                throw new common_1.ForbiddenException({
                    code: 'ACCOUNT_SUSPENDED',
                    message: 'Your account has been temporarily seized. Contact administrator for more.'
                });
            }
            if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
                throw new common_1.ForbiddenException({
                    code: 'SUBSCRIPTION_EXPIRED',
                    message: 'Your subscription date is over.'
                });
            }
        }
        return next.handle();
    }
};
exports.ActiveShopInterceptor = ActiveShopInterceptor;
exports.ActiveShopInterceptor = ActiveShopInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], ActiveShopInterceptor);
//# sourceMappingURL=active-shop.interceptor.js.map