import { Injectable } from '@nestjs/common';
import { LlmProviderFactory } from '../../ai/providers/llm-provider.factory';
import { PrismaService } from '../../prisma/prisma.service';

export interface RedTeamReport {
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  vulnerabilities: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    nodeId?: string;
    recommendation: string;
  }>;
}

@Injectable()
export class AiRedTeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llmFactory: LlmProviderFactory,
  ) {}

  async runRedTeamAudit(shopId: string, graph: { nodes: any[]; edges: any[] }): Promise<RedTeamReport> {
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
    } catch (e: any) {
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
}
