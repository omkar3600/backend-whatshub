import { Injectable, Logger } from '@nestjs/common';
import { AgentOrchestratorService } from '../orchestrator/agent-orchestrator.service';

export interface PersonaSimulationResult {
  persona: string;
  simulatedMessage: string;
  agentResponse: string | null;
  toolsUsed: string[];
  confidenceScore: number;
  policyViolations: string[];
  executionTimeMs: number;
}

@Injectable()
export class AgentSimulationLabService {
  private readonly logger = new Logger(AgentSimulationLabService.name);

  constructor(private readonly orchestrator: AgentOrchestratorService) {}

  async runShadowModeSimulation(
    shopId: string,
    personaType: 'PriceSensitiveBuyer' | 'VIPCustomer' | 'AngryCustomer' | 'HighIntentBuyer',
  ): Promise<PersonaSimulationResult> {
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
}
