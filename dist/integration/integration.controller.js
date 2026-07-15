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
exports.IntegrationController = void 0;
const common_1 = require("@nestjs/common");
const integration_service_1 = require("./integration.service");
const api_key_guard_1 = require("./guards/api-key.guard");
const platform_express_1 = require("@nestjs/platform-express");
let IntegrationController = class IntegrationController {
    integrationService;
    constructor(integrationService) {
        this.integrationService = integrationService;
    }
    async sendMessage(req, body) {
        const shop = req.shop;
        return this.integrationService.sendMessage(shop.id, body.phone, body.text);
    }
    async sendMediaMessage(req, body, file) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        const shop = req.shop;
        return this.integrationService.sendMediaMessage(shop.id, body.phone, file, body.caption);
    }
    async syncContact(req, body) {
        const shop = req.shop;
        return this.integrationService.syncContact(shop.id, body);
    }
};
exports.IntegrationController = IntegrationController;
__decorate([
    (0, common_1.Post)('messages/send'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('messages/send-media'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "sendMediaMessage", null);
__decorate([
    (0, common_1.Post)('contacts/sync'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "syncContact", null);
exports.IntegrationController = IntegrationController = __decorate([
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.Controller)('api/v1/integration'),
    __metadata("design:paramtypes", [integration_service_1.IntegrationService])
], IntegrationController);
//# sourceMappingURL=integration.controller.js.map