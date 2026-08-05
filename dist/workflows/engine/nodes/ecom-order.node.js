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
exports.EcomOrderExecutor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let EcomOrderExecutor = class EcomOrderExecutor {
    prisma;
    type = 'ecomOrder';
    schema = {
        validate: () => { },
        getSchema: () => ({ type: 'object' }),
    };
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(context, nodeData) {
        const action = nodeData.action || 'check_status';
        if (action === 'create_order') {
            const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
            context.variables.lastOrderId = orderId;
            await this.prisma.contact.update({
                where: { id: context.contactId },
                data: { aiLeadStage: 'PAYMENT_PENDING' },
            });
            return {
                status: 'continue',
                branch: 'success',
            };
        }
        return {
            status: 'continue',
            branch: 'success',
        };
    }
};
exports.EcomOrderExecutor = EcomOrderExecutor;
exports.EcomOrderExecutor = EcomOrderExecutor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EcomOrderExecutor);
//# sourceMappingURL=ecom-order.node.js.map