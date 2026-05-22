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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async createShop(body) {
        return this.adminService.createShop(body);
    }
    async getShops() {
        return this.adminService.getShops();
    }
    async updateSubscription(shopId, body) {
        return this.adminService.updateSubscription(shopId, body);
    }
    async updateShop(shopId, body) {
        return this.adminService.updateShop(shopId, body);
    }
    async toggleShopStatus(shopId, body) {
        return this.adminService.toggleShopStatus(shopId, body.status);
    }
    async deleteShop(shopId) {
        return this.adminService.deleteShop(shopId);
    }
    async getStats() {
        return this.adminService.getStats();
    }
    async getRegistrationRequests() {
        return this.adminService.getRegistrationRequests();
    }
    async approveRequest(id) {
        return this.adminService.approveRegistrationRequest(id);
    }
    async rejectRequest(id) {
        return this.adminService.rejectRegistrationRequest(id);
    }
    async getTenantConnections() {
        return this.adminService.getTenantConnections();
    }
    async getWebhookFailures(shopId) {
        return this.adminService.getWebhookFailures(shopId);
    }
    async getDeadLetterEvents(status) {
        return this.adminService.getDeadLetterEvents(status);
    }
    async getTokenHealth() {
        return this.adminService.getTokenHealth();
    }
    async suspendShop(shopId) {
        return this.adminService.suspendShop(shopId);
    }
    async getOnboardingStatus(shopId) {
        return this.adminService.getOnboardingStatus(shopId);
    }
    async setWhatsAppCredentials(shopId, body) {
        return this.adminService.setWhatsAppCredentials(shopId, body);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('shops'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createShop", null);
__decorate([
    (0, common_1.Get)('shops'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getShops", null);
__decorate([
    (0, common_1.Put)('shops/:shopId/subscription'),
    __param(0, (0, common_1.Param)('shopId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.Put)('shops/:shopId'),
    __param(0, (0, common_1.Param)('shopId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateShop", null);
__decorate([
    (0, common_1.Put)('shops/:shopId/status'),
    __param(0, (0, common_1.Param)('shopId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "toggleShopStatus", null);
__decorate([
    (0, common_1.Delete)('shops/:shopId'),
    __param(0, (0, common_1.Param)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteShop", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('requests'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRegistrationRequests", null);
__decorate([
    (0, common_1.Post)('requests/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Post)('requests/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Get)('tenant-connections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTenantConnections", null);
__decorate([
    (0, common_1.Get)('webhook-failures'),
    __param(0, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getWebhookFailures", null);
__decorate([
    (0, common_1.Get)('dead-letter-events'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDeadLetterEvents", null);
__decorate([
    (0, common_1.Get)('token-health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTokenHealth", null);
__decorate([
    (0, common_1.Post)('shops/:shopId/suspend'),
    __param(0, (0, common_1.Param)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "suspendShop", null);
__decorate([
    (0, common_1.Get)('shops/:shopId/onboarding-status'),
    __param(0, (0, common_1.Param)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOnboardingStatus", null);
__decorate([
    (0, common_1.Post)('shops/:shopId/whatsapp-credentials'),
    __param(0, (0, common_1.Param)('shopId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "setWhatsAppCredentials", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map