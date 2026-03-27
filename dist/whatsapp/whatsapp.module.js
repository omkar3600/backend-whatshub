"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappModule = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("./whatsapp.service");
const webhooks_controller_1 = require("./webhooks/webhooks.controller");
const axios_1 = require("@nestjs/axios");
const chatbot_module_1 = require("../chatbot/chatbot.module");
const flows_module_1 = require("../flows/flows.module");
const chat_module_1 = require("../chat/chat.module");
let WhatsappModule = class WhatsappModule {
};
exports.WhatsappModule = WhatsappModule;
exports.WhatsappModule = WhatsappModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, chatbot_module_1.ChatbotModule, (0, common_1.forwardRef)(() => flows_module_1.FlowsModule), chat_module_1.ChatModule],
        providers: [whatsapp_service_1.WhatsappService],
        controllers: [webhooks_controller_1.WebhooksController],
        exports: [whatsapp_service_1.WhatsappService],
    })
], WhatsappModule);
//# sourceMappingURL=whatsapp.module.js.map