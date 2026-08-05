"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AgentSkillRegistry_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSkillRegistry = void 0;
const common_1 = require("@nestjs/common");
let AgentSkillRegistry = AgentSkillRegistry_1 = class AgentSkillRegistry {
    logger = new common_1.Logger(AgentSkillRegistry_1.name);
    SKILLS = {
        ProductRecommendation: {
            id: 'skill_product_recommendation',
            name: 'Product Recommendation Engine',
            description: 'Find matching catalog products based on customer budget, preferences, and purchase history.',
            requiredTools: ['search_products', 'check_stock', 'get_product_details', 'send_interactive_buttons'],
            systemInstructions: 'Focus on presenting top 3 relevant catalog products matching budget and preferences. Always verify inventory.',
            successCriteria: ['product_selected', 'cart_created'],
        },
        LeadQualification: {
            id: 'skill_lead_qualification',
            name: 'Lead Qualification & Scoring',
            description: 'Ask strategic questions to assess intent, budget, and timeline, then score lead.',
            requiredTools: ['get_contact_profile', 'update_lead_stage', 'get_lead_score', 'notify_owner_hot_lead'],
            systemInstructions: 'Collect intent, budget, and purchasing stage. Update CRM stage to QUALIFIED when criteria are met.',
            successCriteria: ['lead_scored', 'stage_updated'],
        },
        CartRecovery: {
            id: 'skill_cart_recovery',
            name: 'Abandoned Cart Recovery',
            description: 'Re-engage customers with unpurchased carts using tailored incentives within discount limits.',
            requiredTools: ['get_contact_profile', 'apply_coupon', 'send_text_message', 'trigger_workflow'],
            systemInstructions: 'Offer permitted discount or free delivery incentives to recover cart. Never exceed maximum 10% discount policy.',
            successCriteria: ['cart_recovered', 'checkout_completed'],
        },
        ComplaintResolution: {
            id: 'skill_complaint_resolution',
            name: 'Complaint & Dispute Escalation',
            description: 'Handle customer disputes empathetically and escalate sensitive issues to human agent.',
            requiredTools: ['escalate_to_human', 'create_note', 'get_order_status'],
            systemInstructions: 'Be empathetic and polite. If double-charging or billing disputes are reported, immediately escalate to human owner.',
            successCriteria: ['human_escalated', 'summary_logged'],
        },
    };
    getSkill(skillId) {
        return this.SKILLS[skillId];
    }
    getSkillsForIntent(intent) {
        const q = intent.toLowerCase();
        const loaded = [];
        if (q.includes('recommend') || q.includes('buy') || q.includes('product') || q.includes('catalog')) {
            loaded.push(this.SKILLS.ProductRecommendation);
        }
        if (q.includes('price') || q.includes('lead') || q.includes('quote') || q.includes('business')) {
            loaded.push(this.SKILLS.LeadQualification);
        }
        if (q.includes('cart') || q.includes('abandon') || q.includes('checkout')) {
            loaded.push(this.SKILLS.CartRecovery);
        }
        if (q.includes('refund') || q.includes('dispute') || q.includes('angry') || q.includes('wrong')) {
            loaded.push(this.SKILLS.ComplaintResolution);
        }
        return loaded.length ? loaded : [this.SKILLS.ProductRecommendation];
    }
};
exports.AgentSkillRegistry = AgentSkillRegistry;
exports.AgentSkillRegistry = AgentSkillRegistry = AgentSkillRegistry_1 = __decorate([
    (0, common_1.Injectable)()
], AgentSkillRegistry);
//# sourceMappingURL=agent-skill.registry.js.map