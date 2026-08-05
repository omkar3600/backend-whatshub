"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AgentSupervisorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSupervisorService = void 0;
const common_1 = require("@nestjs/common");
let AgentSupervisorService = AgentSupervisorService_1 = class AgentSupervisorService {
    logger = new common_1.Logger(AgentSupervisorService_1.name);
    AGENT_PROFILES = {
        CustomerSupportAgent: {
            role: 'CustomerSupportAgent',
            goal: 'Resolve customer inquiries, order status checks, and support issues empathetically and efficiently.',
            systemPolicy: 'Focus on clear support answers. Escalate to human agent if customer is frustrated or issue is unresolvable.',
            allowedTools: ['get_conversation_history', 'get_order_status', 'search_knowledge', 'escalate_to_human', 'send_text_message'],
            permissions: ['customer:read', 'order:read', 'knowledge:read', 'message:send'],
            maxSteps: 6,
        },
        SalesAgent: {
            role: 'SalesAgent',
            goal: 'Guide customer through product catalog, build cart, generate draft order, and close sales.',
            systemPolicy: 'Proactively assist customer with product selection and purchasing. Never hallucinate prices or stock.',
            allowedTools: ['search_products', 'check_stock', 'get_product_details', 'create_cart', 'add_to_cart', 'create_order', 'send_interactive_buttons', 'send_text_message'],
            permissions: ['product:read', 'cart:write', 'order:create', 'message:send'],
            maxSteps: 10,
        },
        LeadQualificationAgent: {
            role: 'LeadQualificationAgent',
            goal: 'Identify purchase intent, collect lead requirements, update pipeline stage, and score lead.',
            systemPolicy: 'Ask clarifying questions to understand budget and timeline. Update CRM stage when intent is verified.',
            allowedTools: ['get_contact_profile', 'update_lead_stage', 'get_lead_score', 'update_contact_notes', 'notify_owner_hot_lead', 'send_text_message'],
            permissions: ['customer:read', 'customer:write', 'crm:write', 'message:send'],
            maxSteps: 8,
        },
        FollowUpAgent: {
            role: 'FollowUpAgent',
            goal: 'Re-engage leads and abandoned cart customers within policy bounds without spamming.',
            systemPolicy: 'Check purchase status before messaging. Stop immediately if order is already completed.',
            allowedTools: ['get_contact_profile', 'get_conversation_summary', 'trigger_workflow', 'send_text_message'],
            permissions: ['customer:read', 'workflow:start', 'message:send'],
            maxSteps: 5,
        },
        MarketingAgent: {
            role: 'MarketingAgent',
            goal: 'Create campaign drafts, analyze audience segments, and schedule broadcast offers.',
            systemPolicy: 'Create campaign drafts for review. Never launch mass broadcasts without owner approval.',
            allowedTools: ['get_campaigns', 'create_campaign_draft', 'get_campaign_stats', 'search_contacts'],
            permissions: ['campaign:read', 'campaign:create', 'customer:read'],
            maxSteps: 6,
        },
        BusinessAssistant: {
            role: 'BusinessAssistant',
            goal: 'Provide executive business metrics, daily briefings, and operational data to the shop owner.',
            systemPolicy: 'Data-driven, concise, executive tone. Report accurate metrics directly from business tools.',
            allowedTools: ['get_daily_business_briefing', 'get_conversation_stats', 'get_lead_pipeline_summary', 'get_campaign_stats', 'get_hot_leads', 'search_products', 'check_stock', 'get_active_workflows'],
            permissions: ['analytics:read', 'campaign:read', 'product:read', 'workflow:read', 'owner:notify'],
            maxSteps: 8,
        },
        ProductRecommendationAgent: {
            role: 'ProductRecommendationAgent',
            goal: 'Recommend relevant products based on customer interests and previous purchase history.',
            systemPolicy: 'Match customer budget and preferences to real catalog items.',
            allowedTools: ['search_products', 'get_product_details', 'get_contact_profile', 'send_interactive_buttons', 'send_text_message'],
            permissions: ['product:read', 'customer:read', 'message:send'],
            maxSteps: 8,
        },
    };
    determineAgentProfile(message, context = {}) {
        if (context.isOwner) {
            return this.AGENT_PROFILES.BusinessAssistant;
        }
        const q = message.toLowerCase();
        if (q.includes('order') || q.includes('track') || q.includes('where is my') || q.includes('delivery') || q.includes('refund') || q.includes('complaint')) {
            return this.AGENT_PROFILES.CustomerSupportAgent;
        }
        if (q.includes('buy') || q.includes('price') || q.includes('cost') || q.includes('cart') || q.includes('purchase') || q.includes('checkout')) {
            return this.AGENT_PROFILES.SalesAgent;
        }
        if (q.includes('recommend') || q.includes('suggest') || q.includes('show me') || q.includes('handbag') || q.includes('product')) {
            return this.AGENT_PROFILES.ProductRecommendationAgent;
        }
        if (q.includes('interested') || q.includes('quote') || q.includes('discount') || q.includes('deal')) {
            return this.AGENT_PROFILES.LeadQualificationAgent;
        }
        return this.AGENT_PROFILES.CustomerSupportAgent;
    }
    getProfile(role) {
        return this.AGENT_PROFILES[role] || this.AGENT_PROFILES.CustomerSupportAgent;
    }
};
exports.AgentSupervisorService = AgentSupervisorService;
exports.AgentSupervisorService = AgentSupervisorService = AgentSupervisorService_1 = __decorate([
    (0, common_1.Injectable)()
], AgentSupervisorService);
//# sourceMappingURL=agent-supervisor.service.js.map