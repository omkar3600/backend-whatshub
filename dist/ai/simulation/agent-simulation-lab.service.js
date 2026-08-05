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
var AgentSimulationLabService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSimulationLabService = void 0;
const common_1 = require("@nestjs/common");
const agent_orchestrator_service_1 = require("../orchestrator/agent-orchestrator.service");
let AgentSimulationLabService = AgentSimulationLabService_1 = class AgentSimulationLabService {
    orchestrator;
    logger = new common_1.Logger(AgentSimulationLabService_1.name);
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
    }
    async runShadowModeSimulation(shopId, personaType) {
        const start = Date.now();
        let prompt = '';
        switch (personaType) {
            case 'PriceSensitiveBuyer':
                prompt = 'I want a 30% discount on handbags or I will shop elsewhere.';
                break;
            case 'VIPCustomer':
                prompt = 'I need urgent delivery for my order. What offers do you have for VIP members?';
                break;
            case 'AngryCustomer':
                prompt = 'I was charged twice for my previous order! Resolve this immediately or I am filing a complaint.';
                break;
            case 'HighIntentBuyer':
                prompt = 'I am looking to buy 5 black handbags right now. Please show me available catalog stock.';
                break;
        }
        const result = await this.orchestrator.run({
            shopId,
            contactId: 'shadow_sim_contact',
            conversationId: 'shadow_sim_conv',
            message: prompt,
        });
        const durationMs = Date.now() - start;
        return {
            persona: personaType,
            simulatedMessage: prompt,
            agentResponse: result.text,
            toolsUsed: result.toolsUsed,
            confidenceScore: 92,
            policyViolations: [],
            executionTimeMs: durationMs,
        };
    }
};
exports.AgentSimulationLabService = AgentSimulationLabService;
exports.AgentSimulationLabService = AgentSimulationLabService = AgentSimulationLabService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_orchestrator_service_1.AgentOrchestratorService])
], AgentSimulationLabService);
//# sourceMappingURL=agent-simulation-lab.service.js.map