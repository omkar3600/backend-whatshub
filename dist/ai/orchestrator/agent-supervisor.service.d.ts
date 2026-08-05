export type AgentRole = 'CustomerSupportAgent' | 'SalesAgent' | 'LeadQualificationAgent' | 'FollowUpAgent' | 'MarketingAgent' | 'BusinessAssistant' | 'ProductRecommendationAgent';
export interface AgentProfile {
    role: AgentRole;
    goal: string;
    systemPolicy: string;
    allowedTools: string[];
    permissions: string[];
    maxSteps: number;
}
export declare class AgentSupervisorService {
    private readonly logger;
    private readonly AGENT_PROFILES;
    determineAgentProfile(message: string, context?: {
        isOwner?: boolean;
        hasCart?: boolean;
    }): AgentProfile;
    getProfile(role: AgentRole): AgentProfile;
}
