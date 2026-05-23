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
exports.ActiveShopGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const bypass_shop_status_decorator_1 = require("../decorators/bypass-shop-status.decorator");
let ActiveShopGuard = class ActiveShopGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const isBypassed = this.reflector.getAllAndOverride(bypass_shop_status_decorator_1.IS_PUBLIC_SHOP_STATUS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isBypassed) {
            return true;
        }
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (!user || user.role === 'admin') {
            return true;
        }
        const shop = await this.prisma.shop.findUnique({
            where: { ownerId: user.id },
            include: { subscription: true }
        });
        if (shop) {
            if (shop.status !== 'active') {
                throw new common_1.ForbiddenException({
                    code: 'ACCOUNT_SUSPENDED',
                    message: 'Your account has been temporarily seized. Contact administrator for more.'
                });
            }
            if (shop.subscription && new Date(shop.subscription.expiryDate) < new Date()) {
                throw new common_1.ForbiddenException({
                    code: 'SUBSCRIPTION_EXPIRED',
                    message: 'Your subscription date is over.'
                });
            }
        }
        return true;
    }
};
exports.ActiveShopGuard = ActiveShopGuard;
exports.ActiveShopGuard = ActiveShopGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], ActiveShopGuard);
//# sourceMappingURL=active-shop.guard.js.map