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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistry = void 0;
const common_1 = require("@nestjs/common");
const knowledge_tools_1 = require("../impl/knowledge-tools");
const contact_tools_1 = require("../impl/contact-tools");
const conversation_tools_1 = require("../impl/conversation-tools");
const whatsapp_tools_1 = require("../impl/whatsapp-tools");
const campaign_tools_1 = require("../impl/campaign-tools");
const lead_tools_1 = require("../impl/lead-tools");
const analytics_tools_1 = require("../impl/analytics-tools");
const handoff_tool_1 = require("../impl/handoff-tool");
let ToolRegistry = class ToolRegistry {
    knowledge;
    contacts;
    conversations;
    whatsapp;
    campaigns;
    leads;
    analytics;
    handoff;
    tools = new Map();
    constructor(knowledge, contacts, conversations, whatsapp, campaigns, leads, analytics, handoff) {
        this.knowledge = knowledge;
        this.contacts = contacts;
        this.conversations = conversations;
        this.whatsapp = whatsapp;
        this.campaigns = campaigns;
        this.leads = leads;
        this.analytics = analytics;
        this.handoff = handoff;
    }
    onModuleInit() {
        const allTools = [
            ...this.knowledge.getTools(),
            ...this.contacts.getTools(),
            ...this.conversations.getTools(),
            ...this.whatsapp.getTools(),
            ...this.campaigns.getTools(),
            ...this.leads.getTools(),
            ...this.analytics.getTools(),
            ...this.handoff.getTools(),
        ];
        for (const tool of allTools) {
            this.tools.set(tool.name, tool);
        }
    }
    get(name) {
        return this.tools.get(name);
    }
    getAll() {
        return Array.from(this.tools.values());
    }
    getAvailableTools(autonomyLevel, allowedTools) {
        return this.getAll().filter(t => {
            if (allowedTools && allowedTools.length > 0 && !allowedTools.includes(t.name))
                return false;
            return true;
        });
    }
};
exports.ToolRegistry = ToolRegistry;
exports.ToolRegistry = ToolRegistry = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [knowledge_tools_1.KnowledgeTools,
        contact_tools_1.ContactTools,
        conversation_tools_1.ConversationTools,
        whatsapp_tools_1.WhatsAppTools,
        campaign_tools_1.CampaignTools,
        lead_tools_1.LeadTools,
        analytics_tools_1.AnalyticsTools,
        handoff_tool_1.HandoffTool])
], ToolRegistry);
//# sourceMappingURL=tool.registry.js.map