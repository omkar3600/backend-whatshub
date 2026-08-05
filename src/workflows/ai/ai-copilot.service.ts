import { Injectable } from '@nestjs/common';
import { LlmProviderFactory } from '../../ai/providers/llm-provider.factory';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiCopilotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llmFactory: LlmProviderFactory,
  ) {}

  async editGraphWithInstruction(
    shopId: string,
    graph: { nodes: any[]; edges: any[] },
    instruction: string
  ): Promise<{ nodes: any[]; edges: any[]; explanation: string }> {
    const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
    const llm = await this.llmFactory.create(config || {});

    const prompt = `You are an expert AI Workflow Architect for WhatsHub.
Current Workflow Graph: ${JSON.stringify(graph)}

User Instruction: "${instruction}"

Modify the React Flow graph according to the user instruction. Keep existing valid nodes where appropriate, add new nodes if needed, and update edges cleanly.
Return a JSON object matching this exact structure:
{
  "nodes": [...],
  "edges": [...],
  "explanation": "Brief explanation of changes made"
}`;

    try {
      const response = await llm.generateCompletion([
        { role: 'system', content: 'You are an AI Workflow Copilot for modifying visual workflow graphs.' },
        { role: 'user', content: prompt },
      ], [], { temperature: 0.2 });

      const jsonStr = (response.content || '{}').replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      return {
        nodes: parsed.nodes || graph.nodes,
        edges: parsed.edges || graph.edges,
        explanation: parsed.explanation || 'Graph updated based on instruction.',
      };
    } catch (e: any) {
      return {
        nodes: graph.nodes,
        edges: graph.edges,
        explanation: `Failed to edit graph: ${e.message}`,
      };
    }
  }

  async explainWorkflowGraph(shopId: string, graph: { nodes: any[]; edges: any[] }): Promise<{ explanation: string }> {
    const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
    const llm = await this.llmFactory.create(config || {});

    const prompt = `Explain the following visual workflow graph in simple business terms:
Graph: ${JSON.stringify(graph)}

Summarize step-by-step how customer messages flow through this workflow.`;

    try {
      const response = await llm.generateCompletion([
        { role: 'system', content: 'You are an AI Workflow Explainer.' },
        { role: 'user', content: prompt },
      ], [], { temperature: 0.3 });

      return { explanation: response.content || 'Workflow graph consists of triggers and action nodes.' };
    } catch (e: any) {
      return { explanation: 'Could not generate explanation.' };
    }
  }
}
