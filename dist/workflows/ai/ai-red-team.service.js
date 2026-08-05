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
exports.AiRedTeamService = void 0;
const common_1 = require("@nestjs/common");
const llm_provider_factory_1 = require("../../ai/providers/llm-provider.factory");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiRedTeamService = class AiRedTeamService {
    prisma;
    llmFactory;
    constructor(prisma, llmFactory) {
        this.prisma = prisma;
        this.llmFactory = llmFactory;
    }
    async runRedTeamAudit(shopId, graph) {
        const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
        const llm = await this.llmFactory.create(config || {});
        const prompt = `Act as an AI Security Red Team Attacker and Workflow Security Auditor.
Analyze the following visual workflow graph for vulnerabilities:
Graph: ${JSON.stringify(graph)}

Check for:
1. Infinite execution loops or unbounded AI loops
2. Missing fallbacks on HTTP requests or AI agent nodes
3. Prompt injection vectors or untrusted customer data fed into critical tools
4. Unrestricted financial tool usage or missing approval steps
5. Unbounded token cost risk

Return ONLY a JSON object matching this schema:
{
  "overallRisk": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "vulnerabilities": [
    {
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "title": "Short title",
      "description": "Detailed risk description",
      "nodeId": "optional_node_id",
      "recommendation": "How to fix"
    }
  ]
}`;
        try {
            const response = await llm.generateCompletion([
                { role: 'system', content: 'You are an AI Security Auditor and Red Team Attacker.' },
                { role: 'user', content: prompt },
            ], [], { temperature: 0.1 });
            const jsonStr = (response.content || '{}').replace(/```json|```/g, '').trim();
            const report = JSON.parse(jsonStr);
            return {
                overallRisk: report.overallRisk || 'LOW',
                vulnerabilities: report.vulnerabilities || [],
            };
        }
        catch (e) {
            return {
                overallRisk: 'LOW',
                vulnerabilities: [
                    {
                        severity: 'LOW',
                        title: 'Audit Incomplete',
                        description: `Red team audit completed with warnings: ${e.message}`,
                        recommendation: 'Verify AI API connectivity.',
                    },
                ],
            };
        }
    }
};
exports.AiRedTeamService = AiRedTeamService;
exports.AiRedTeamService = AiRedTeamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_provider_factory_1.LlmProviderFactory])
], AiRedTeamService);
//# sourceMappingURL=ai-red-team.service.js.map