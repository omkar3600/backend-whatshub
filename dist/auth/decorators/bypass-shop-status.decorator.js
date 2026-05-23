"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BypassShopStatus = exports.IS_PUBLIC_SHOP_STATUS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_PUBLIC_SHOP_STATUS_KEY = 'bypassShopStatus';
const BypassShopStatus = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_SHOP_STATUS_KEY, true);
exports.BypassShopStatus = BypassShopStatus;
//# sourceMappingURL=bypass-shop-status.decorator.js.map