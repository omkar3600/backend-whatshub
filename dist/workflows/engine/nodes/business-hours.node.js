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
var BusinessHoursExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessHoursExecutor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
class BusinessHoursSchema {
    validate(config) { }
    getSchema() {
        return {
            type: 'object',
            properties: {
                startHour: { type: 'number', default: 9 },
                endHour: { type: 'number', default: 18 },
                timezone: { type: 'string', default: 'UTC' },
            },
        };
    }
}
let BusinessHoursExecutor = BusinessHoursExecutor_1 = class BusinessHoursExecutor {
    prisma;
    type = 'businessHours';
    schema = new BusinessHoursSchema();
    logger = new common_1.Logger(BusinessHoursExecutor_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(context, nodeData) {
        this.logger.log(`[Workflow Node] Executing BusinessHours for instance ${context.instanceId}`);
        const now = new Date();
        const currentHour = now.getUTCHours();
        const start = typeof nodeData.startHour === 'number' ? nodeData.startHour : 9;
        const end = typeof nodeData.endHour === 'number' ? nodeData.endHour : 18;
        const isOpen = currentHour >= start && currentHour < end;
        const branch = isOpen ? 'open' : 'closed';
        this.logger.log(`[BusinessHours Node] Hour=${currentHour} (${start}:00-${end}:00) -> Branch: ${branch}`);
        context.variables.businessHoursStatus = branch;
        return { status: 'continue', branch };
    }
};
exports.BusinessHoursExecutor = BusinessHoursExecutor;
exports.BusinessHoursExecutor = BusinessHoursExecutor = BusinessHoursExecutor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusinessHoursExecutor);
//# sourceMappingURL=business-hours.node.js.map