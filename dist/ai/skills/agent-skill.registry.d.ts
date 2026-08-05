export interface AgentSkill {
    id: string;
    name: string;
    description: string;
    requiredTools: string[];
    systemInstructions: string;
    successCriteria: string[];
}
export declare class AgentSkillRegistry {
    private readonly logger;
    private readonly SKILLS;
    getSkill(skillId: string): AgentSkill | undefined;
    getSkillsForIntent(intent: string): AgentSkill[];
}
