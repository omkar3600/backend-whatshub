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
exports.KnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let KnowledgeService = class KnowledgeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(shopId) {
        return this.prisma.aiKnowledgeSource.findMany({ where: { shopId }, orderBy: { createdAt: 'desc' } });
    }
    async create(shopId, data) {
        return this.prisma.aiKnowledgeSource.create({ data: { shopId, ...data, category: data.category || 'general' } });
    }
    async update(id, shopId, data) {
        const src = await this.prisma.aiKnowledgeSource.findFirst({ where: { id, shopId } });
        if (!src)
            throw new common_1.NotFoundException('Knowledge source not found');
        return this.prisma.aiKnowledgeSource.update({ where: { id }, data });
    }
    async delete(id, shopId) {
        const src = await this.prisma.aiKnowledgeSource.findFirst({ where: { id, shopId } });
        if (!src)
            throw new common_1.NotFoundException('Knowledge source not found');
        await this.prisma.aiKnowledgeSource.delete({ where: { id } });
        return { success: true };
    }
};
exports.KnowledgeService = KnowledgeService;
exports.KnowledgeService = KnowledgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KnowledgeService);
//# sourceMappingURL=knowledge.service.js.map