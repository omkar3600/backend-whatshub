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
var AgentEventDispatcher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentEventDispatcher = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const next_best_action_service_1 = require("../intelligence/next-best-action.service");
const agent_orchestrator_service_1 = require("../orchestrator/agent-orchestrator.service");
const ai_policy_engine_service_1 = require("../policy/ai-policy-engine.service");
let AgentEventDispatcher = AgentEventDispatcher_1 = class AgentEventDispatcher {
    prisma;
    nextBestAction;
    orchestrator;
    policyEngine;
    logger = new common_1.Logger(AgentEventDispatcher_1.name);
    constructor(prisma, nextBestAction, orchestrator, policyEngine) {
        this.prisma = prisma;
        this.nextBestAction = nextBestAction;
        this.orchestrator = orchestrator;
        this.policyEngine = policyEngine;
    }
    async dispatch(event) {
        this.logger.log(`[EventDispatcher] Processing event ${event.eventType} for contact ${event.contactId} in shop ${event.shopId}`);
        const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId: event.shopId } });
        if (!config?.isActive || !config?.agentMode) {
            return { acted: false, reason: 'AI Agent is not active or agent mode is disabled.' };
        }
        const prediction = await this.nextBestAction.predict(event.shopId, event.contactId);
        if (prediction.action === 'DO_NOTHING' || prediction.confidence < 50) {
            this.logger.log(`[EventDispatcher] Agent decided DO_NOTHING for contact ${event.contactId} (confidence: ${prediction.confidence}%)`);
            return {
                acted: false,
                actionTaken: 'DO_NOTHING',
                reason: prediction.rationale || 'Next best action confidence below threshold or DO_NOTHING predicted.',
            };
        }
        const policyResult = await this.policyEngine.evaluateToolCall(event.shopId, prediction.recommendedTool || 'send_text_message', prediction.toolParams || {}, config.autonomyLevel ?? 2);
        if (!policyResult.allowed) {
            this.logger.warn(`[EventDispatcher] Event action blocked by policy: ${policyResult.reason}`);
            return {
                acted: false,
                actionTaken: prediction.action,
                reason: policyResult.reason || 'Action blocked by business policy.',
            };
        }
        const promptMessage = `System Trigger Event: ${event.eventType}. Recommended Action: ${prediction.action}. Context: ${prediction.rationale}`;
        let conversation = await this.prisma.conversation.findUnique({
            where: { shopId_contactId: { shopId: event.shopId, contactId: event.contactId } },
        });
        if (!conversation) {
            conversation = await this.prisma.conversation.create({
                data: {
                    shopId: event.shopId,
                    contactId: event.contactId,
                },
            });
        }
        const result = await this.orchestrator.run({
            shopId: event.shopId,
            contactId: event.contactId,
            conversationId: conversation.id,
            message: promptMessage,
        });
        return {
            acted: true,
            actionTaken: prediction.action,
            reason: prediction.rationale,
            toolsUsed: result.toolsUsed,
        };
    }
};
exports.AgentEventDispatcher = AgentEventDispatcher;
exports.AgentEventDispatcher = AgentEventDispatcher = AgentEventDispatcher_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        next_best_action_service_1.NextBestActionEngine,
        agent_orchestrator_service_1.AgentOrchestratorService,
        ai_policy_engine_service_1.AiPolicyEngineService])
], AgentEventDispatcher);
//# sourceMappingURL=agent-event.dispatcher.js.map