"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowsModule = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
const flows_controller_1 = require("./flows.controller");
const flows_service_1 = require("./flows.service");
const flow_engine_service_1 = require("./flow-engine.service");
let FlowsModule = class FlowsModule {
};
exports.FlowsModule = FlowsModule;
exports.FlowsModule = FlowsModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => whatsapp_module_1.WhatsappModule)],
        controllers: [flows_controller_1.FlowsController],
        providers: [flows_service_1.FlowsService, flow_engine_service_1.FlowEngineService],
        exports: [flow_engine_service_1.FlowEngineService]
    })
], FlowsModule);
//# sourceMappingURL=flows.module.js.map