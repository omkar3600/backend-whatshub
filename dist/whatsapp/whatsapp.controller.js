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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const whatsapp_service_1 = require("./whatsapp.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let WhatsappController = class WhatsappController {
    whatsappService;
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    async getProfile(req) {
        return this.whatsappService.getBusinessProfile(req.user.shopId);
    }
    async updateProfile(req, data) {
        return this.whatsappService.updateBusinessProfile(req.user.shopId, data);
    }
    async uploadPicture(req, file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        return this.whatsappService.uploadProfilePicture(req.user.shopId, file);
    }
    async updateName(req, newName) {
        if (!newName)
            throw new common_1.BadRequestException('Name is required');
        return this.whatsappService.updateDisplayName(req.user.shopId, newName);
    }
    async registerNumber(req, pin) {
        return this.whatsappService.registerActiveNumber(req.user.shopId, pin);
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('picture'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "uploadPicture", null);
__decorate([
    (0, common_1.Post)('name'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "updateName", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('pin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "registerNumber", null);
exports.WhatsappController = WhatsappController = __decorate([
    (0, common_1.Controller)('whatsapp/profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map