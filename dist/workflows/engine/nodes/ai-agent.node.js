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
var AiAgentExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAgentExecutor = void 0;
const common_1 = require("@nestjs/common");
const agent_orchestrator_service_1 = require("../../../ai/orchestrator/agent-orchestrator.service");
const whatsapp_service_1 = require("../../../whatsapp/whatsapp.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
class AiAgentSchema {
    validate(config) { }
    getSchema() {
        return {
            type: "object",
            properties: {
                systemPromptOverride: { type: "string" },
                autoSendReply: { type: "boolean" },
                outputVariable: { type: "string" },
            },
        };
    }
}
let AiAgentExecutor = AiAgentExecutor_1 = class AiAgentExecutor {
    prisma;
    orchestrator;
    whatsappService;
    type = "aiAgent";
    schema = new AiAgentSchema();
    logger = new common_1.Logger(AiAgentExecutor_1.name);
    constructor(prisma, orchestrator, whatsappService) {
        this.prisma = prisma;
        this.orchestrator = orchestrator;
        this.whatsappService = whatsappService;
    }
    async execute(context, nodeData) {
        this.logger.log(`[Workflow Node] Executing AI Agent node for instance ${context.instanceId}`);
        try {
            const contact = await this.prisma.contact.findUnique({
                where: { id: context.contactId },
            });
            if (!contact)
                throw new Error("Contact not found for workflow execution");
            const conversation = await this.prisma.conversation.findFirst({
                where: { shopId: context.shopId, contactId: context.contactId },
            });
            const messageText = nodeData.userMessage || context.variables.lastMessageText || "Hello";
            const result = await this.orchestrator.run({
                shopId: context.shopId,
                contactId: context.contactId,
                conversationId: conversation?.id || "",
                message: messageText,
            });
            const varName = nodeData.outputVariable || "aiResponse";
            context.variables[varName] = result.text || "";
            const autoSend = nodeData.autoSendReply !== false;
            if (autoSend && result.text) {
                this.logger.log(`[Workflow Node] Auto-sending AI response to ${contact.phone}`);
                await this.whatsappService.sendOutboundMessage(context.shopId, contact.phone, "text", result.text);
            }
            return { status: "continue" };
        }
        catch (error) {
            this.logger.error(`[Workflow Node] AI Agent node execution failed: ${error.message}`);
            return { status: "error", error: error.message };
        }
    }
};
exports.AiAgentExecutor = AiAgentExecutor;
exports.AiAgentExecutor = AiAgentExecutor = AiAgentExecutor_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => agent_orchestrator_service_1.AgentOrchestratorService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => whatsapp_service_1.WhatsappService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        agent_orchestrator_service_1.AgentOrchestratorService,
        whatsapp_service_1.WhatsappService])
], AiAgentExecutor);
//# sourceMappingURL=ai-agent.node.js.map