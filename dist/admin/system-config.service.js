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
var SystemConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SystemConfigService = SystemConfigService_1 = class SystemConfigService {
    prisma;
    logger = new common_1.Logger(SystemConfigService_1.name);
    cache = {};
    cacheLoadedAt = null;
    cacheTtlMs = 60_000;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async loadCache() {
        const rows = await this.prisma.systemConfig.findMany();
        this.cache = {};
        for (const row of rows) {
            this.cache[row.key] = row.value;
        }
        this.cacheLoadedAt = new Date();
    }
    async get(key, envFallback) {
        const now = Date.now();
        const stale = !this.cacheLoadedAt || (now - this.cacheLoadedAt.getTime()) > this.cacheTtlMs;
        if (stale)
            await this.loadCache();
        return this.cache[key] ?? envFallback ?? process.env[key];
    }
    async set(key, value, isSecret = false, updatedBy) {
        await this.prisma.systemConfig.upsert({
            where: { key },
            create: { id: require('crypto').randomUUID(), key, value, isSecret, updatedBy },
            update: { value, isSecret, updatedBy },
        });
        this.cache[key] = value;
        this.logger.log(`[SystemConfig] Set key="${key}" (secret=${isSecret}) by ${updatedBy || 'system'}`);
    }
    async getAll() {
        const rows = await this.prisma.systemConfig.findMany({ orderBy: { key: 'asc' } });
        return rows.map(r => ({
            key: r.key,
            value: r.isSecret ? '••••••••' : r.value,
            isSecret: r.isSecret,
            updatedAt: r.updatedAt,
            updatedBy: r.updatedBy,
        }));
    }
    async delete(key) {
        await this.prisma.systemConfig.deleteMany({ where: { key } });
        delete this.cache[key];
        this.logger.log(`[SystemConfig] Deleted key="${key}"`);
    }
    invalidateCache() {
        this.cacheLoadedAt = null;
        this.cache = {};
    }
};
exports.SystemConfigService = SystemConfigService;
exports.SystemConfigService = SystemConfigService = SystemConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemConfigService);
//# sourceMappingURL=system-config.service.js.map