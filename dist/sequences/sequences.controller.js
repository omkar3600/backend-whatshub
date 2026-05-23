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
exports.SequencesController = void 0;
const common_1 = require("@nestjs/common");
const sequences_service_1 = require("./sequences.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SequencesController = class SequencesController {
    sequencesService;
    constructor(sequencesService) {
        this.sequencesService = sequencesService;
    }
    async create(req, data) {
        return this.sequencesService.createSequence(req.user.shopId, data);
    }
    async findAll(req) {
        return this.sequencesService.getSequences(req.user.shopId);
    }
    async toggle(req, id, data) {
        return this.sequencesService.toggleSequence(req.user.shopId, id, data.isActive);
    }
    async delete(req, id) {
        return this.sequencesService.deleteSequence(req.user.shopId, id);
    }
};
exports.SequencesController = SequencesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SequencesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SequencesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(':id/toggle'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SequencesController.prototype, "toggle", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SequencesController.prototype, "delete", null);
exports.SequencesController = SequencesController = __decorate([
    (0, common_1.Controller)('sequences'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sequences_service_1.SequencesService])
], SequencesController);
//# sourceMappingURL=sequences.controller.js.map