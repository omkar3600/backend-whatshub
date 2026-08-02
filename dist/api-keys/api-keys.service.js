"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
let ApiKeysService = class ApiKeysService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    hashKey(key) {
        return crypto.createHash('sha256').update(key).digest('hex');
    }
    parseScopes(scopesField) {
        if (!scopesField)
            return [];
        if (Array.isArray(scopesField))
            return scopesField;
        if (typeof scopesField === 'string') {
            try {
                const parsed = JSON.parse(scopesField);
                return Array.isArray(parsed) ? parsed : [];
            }
            catch {
                return [];
            }
        }
        return [];
    }
    async createApiKey(shopId, name, scopes = []) {
        const rawKey = 'wh_' + crypto.randomBytes(32).toString('hex');
        const keyHash = this.hashKey(rawKey);
        const apiKey = await this.prisma.apiKey.create({
            data: {
                shopId,
                name,
                keyHash,
                scopes: scopes,
            },
        });
        return {
            apiKey: {
                id: apiKey.id,
                name: apiKey.name,
                scopes: this.parseScopes(apiKey.scopes),
                status: apiKey.status,
                createdAt: apiKey.createdAt,
            },
            rawKey,
        };
    }
    async listApiKeys(shopId) {
        const keys = await this.prisma.apiKey.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                scopes: true,
                lastUsedAt: true,
                expiresAt: true,
                status: true,
                createdAt: true,
            }
        });
        return keys.map(k => ({
            ...k,
            scopes: this.parseScopes(k.scopes)
        }));
    }
    async revokeApiKey(shopId, keyId) {
        const key = await this.prisma.apiKey.findFirst({
            where: { id: keyId, shopId }
        });
        if (!key)
            throw new common_1.NotFoundException('API Key not found');
        return this.prisma.apiKey.update({
            where: { id: keyId },
            data: { status: 'revoked' },
            select: { id: true, status: true }
        });
    }
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map