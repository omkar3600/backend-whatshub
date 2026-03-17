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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async registerInterest(data) {
        const { username, email, password, shopName, phone } = data;
        const existingUser = await this.prisma.user.findUnique({ where: { username } });
        const existingRequest = await this.prisma.registrationInterest.findFirst({
            where: { OR: [{ username }, { email }] }
        });
        if (existingUser || (existingRequest && existingRequest.status === 'pending')) {
            throw new common_1.ConflictException('Username or email already in use or pending approval');
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        await this.prisma.registrationInterest.create({
            data: {
                username,
                email,
                password: passwordHash,
                shopName,
                phone,
                status: 'pending'
            },
        });
        return { message: 'Registration interest submitted. Please wait for admin approval.' };
    }
    async registerShop(data) {
        const { username, email, password, shopName, phone } = data;
        const existingUser = await this.prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            throw new common_1.ConflictException('Username already in use');
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await this.prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                role: 'user',
            },
        });
        const shop = await this.prisma.shop.create({
            data: {
                ownerId: user.id,
                shopName,
                phone,
            },
        });
        return { message: 'Shop registered successfully', shopId: shop.id };
    }
    async login(data) {
        const { username, password } = data;
        this.logger.log(`Attempting login for username: "${username}"`);
        const user = await this.prisma.user.findUnique({
            where: { username },
            include: { shop: true }
        });
        if (!user) {
            this.logger.warn(`User NOT FOUND for username: "${username}"`);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            this.logger.warn(`Password MISMATCH for username: "${username}"`);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        this.logger.log(`Login SUCCESS for username: "${username}"`);
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            shopId: user.shop?.id
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                shopId: user.shop?.id
            }
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map