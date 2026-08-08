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
const knowledge_tools_1 = require("./tools/impl/knowledge-tools");
const contact_tools_1 = require("./tools/impl/contact-tools");
const conversation_tools_1 = require("./tools/impl/conversation-tools");
const whatsapp_tools_1 = require("./tools/impl/whatsapp-tools");
const campaign_tools_1 = require("./tools/impl/campaign-tools");
const lead_tools_1 = require("./tools/impl/lead-tools");
const analytics_tools_1 = require("./tools/impl/analytics-tools");
const handoff_tool_1 = require("./tools/impl/handoff-tool");
const product_tools_1 = require("./tools/impl/product-tools");
const sales_tools_1 = require("./tools/impl/sales-tools");
const workflow_tools_1 = require("./tools/impl/workflow-tools");
const owner_tools_1 = require("./tools/impl/owner-tools");
const business_agent_service_1 = require("./business/business-agent.service");
const business_agent_controller_1 = require("./business/business-agent.controller");
const knowledge_service_1 = require("./knowledge/knowledge.service");
const knowledge_controller_1 = require("./knowledge/knowledge.controller");
const followup_service_1 = require("./followup/followup.service");
const prisma_module_1 = require("../prisma/prisma.module");
const common_module_1 = require("../common/common.module");
const admin_module_1 = require("../admin/admin.module");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
const campaigns_module_1 = require("../campaigns/campaigns.module");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            common_module_1.CommonModule,
            admin_module_1.AdminModule,
            campaigns_module_1.CampaignsModule,
            bullmq_1.BullModule.registerQueue({ name: 'ai-agent-queue' }),
            (0, common_1.forwardRef)(() => whatsapp_module_1.WhatsappModule),
        ],
        providers: [
            llm_provider_factory_1.LlmProviderFactory,
            tool_registry_1.ToolRegistry,
            knowledge_tools_1.KnowledgeTools,
            contact_tools_1.ContactTools,
            conversation_tools_1.ConversationTools,
            whatsapp_tools_1.WhatsAppTools,
            campaign_tools_1.CampaignTools,
            lead_tools_1.LeadTools,
            analytics_tools_1.AnalyticsTools,
            handoff_tool_1.HandoffTool,
            product_tools_1.ProductTools,
            sales_tools_1.SalesTools,
            workflow_tools_1.WorkflowTools,
            owner_tools_1.OwnerTools,
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