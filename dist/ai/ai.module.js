"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const llm_provider_factory_1 = require("./providers/llm-provider.factory");
const tool_registry_1 = require("./tools/registry/tool.registry");
const business_agent_service_1 = require("./business/business-agent.service");
const business_agent_controller_1 = require("./business/business-agent.controller");
const knowledge_service_1 = require("./knowledge/knowledge.service");
const knowledge_controller_1 = require("./knowledge/knowledge.controller");
const followup_service_1 = require("./followup/followup.service");
const prisma_module_1 = require("../prisma/prisma.module");
const common_module_1 = require("../common/common.module");
const admin_module_1 = require("../admin/admin.module");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            common_module_1.CommonModule,
            admin_module_1.AdminModule,
            bullmq_1.BullModule.registerQueue({ name: 'ai-agent-queue' }),
            (0, common_1.forwardRef)(() => whatsapp_module_1.WhatsappModule),
        ],
        providers: [
            llm_provider_factory_1.LlmProviderFactory,
            tool_registry_1.ToolRegistry,
            business_agent_service_1.BusinessAgentService,
            knowledge_service_1.KnowledgeService,
            followup_service_1.FollowUpService,
        ],
        controllers: [
            business_agent_controller_1.BusinessAgentController,
            knowledge_controller_1.KnowledgeController,
        ],
        exports: [
            business_agent_service_1.BusinessAgentService,
            knowledge_service_1.KnowledgeService,
            followup_service_1.FollowUpService,
            llm_provider_factory_1.LlmProviderFactory,
            tool_registry_1.ToolRegistry,
        ],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map