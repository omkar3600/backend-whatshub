"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BusinessEventBus_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessEventBus = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let BusinessEventBus = BusinessEventBus_1 = class BusinessEventBus {
    logger = new common_1.Logger(BusinessEventBus_1.name);
    event$ = new rxjs_1.Subject();
    publish(type, shopId, payload, contactId) {
        const event = {
            id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            type,
            shopId,
            contactId,
            payload,
            timestamp: new Date().toISOString(),
            idempotencyKey: `${type}:${shopId}:${contactId || 'shop'}:${Date.now()}`,
        };
        this.logger.log(`[EventBus] Published event ${event.type} for shop ${shopId}`);
        this.event$.next(event);
        return event;
    }
    on(type, shopId) {
        return this.event$.asObservable().pipe((0, operators_1.filter)(event => event.type === type && (!shopId || event.shopId === shopId)));
    }
    ofShop(shopId) {
        return this.event$.asObservable().pipe((0, operators_1.filter)(event => event.shopId === shopId));
    }
};
exports.BusinessEventBus = BusinessEventBus;
exports.BusinessEventBus = BusinessEventBus = BusinessEventBus_1 = __decorate([
    (0, common_1.Injectable)()
], BusinessEventBus);
//# sourceMappingURL=business-event.bus.js.map