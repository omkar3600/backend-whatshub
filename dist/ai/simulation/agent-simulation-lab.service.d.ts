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
export declare class AgentSimulationLabService {
    private readonly orchestrator;
    private readonly logger;
    constructor(orchestrator: AgentOrchestratorService);
    runShadowModeSimulation(shopId: string, personaType: 'PriceSensitiveBuyer' | 'VIPCustomer' | 'AngryCustomer' | 'HighIntentBuyer'): Promise<PersonaSimulationResult>;
}
