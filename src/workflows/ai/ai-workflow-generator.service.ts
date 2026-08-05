import { Injectable, Logger } from '@nestjs/common';
import { LlmProviderFactory } from '../../ai/providers/llm-provider.factory';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AiWorkflowGeneratorService {
  private readonly logger = new Logger(AiWorkflowGeneratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmFactory: LlmProviderFactory,
  ) {}

  async generateGraphFromPrompt(shopId: string, prompt: string): Promise<{ nodes: any[]; edges: any[]; explanation: string }> {
    const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId } });
    const llm = await this.llmFactory.create(config || {});

    const systemPrompt = `You are a visual workflow automation architect. Translate the user prompt into a valid React Flow graph JSON for WhatsApp automation.
Available Node Types:
- trigger (source only)
- sendMessage
- delay
- condition
- waitReply
- aiAgent
- aiIntentRouter
- searchProducts
- askQuestion
- httpRequest
- crmAction
- abTestSplitter
- dataTransform
- forEach
- businessHours
- teamHandoff
- approvalNode

Output ONLY a JSON object with format:
{
  "nodes": [ { "id": "node_1", "type": "trigger", "data": { "label": "Start" }, "position": { "x": 250, "y": 0 } } ],
  "edges": [ { "id": "edge_1", "source": "node_1", "target": "node_2" } ],
  "explanation": "Brief description of the workflow logic."
}`;

    const response = await llm.generateCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ], [], { temperature: 0.2 });

    try {
      const jsonStr = (response.content || '{}').replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      return {
        nodes: parsed.nodes || [],
        edges: parsed.edges || [],
        explanation: parsed.explanation || 'Workflow generated successfully.',
      };
    } catch (e) {
      this.logger.warn(`Failed to parse generated workflow graph: ${response.content}`);
      return {
        nodes: [
          { id: '1', type: 'trigger', data: { label: 'Start Trigger' }, position: { x: 250, y: 0 } },
          { id: '2', type: 'aiAgent', data: { label: 'AI Agent' }, position: { x: 250, y: 150 } },
        ],
        edges: [{ id: 'e1-2', source: '1', target: '2' }],
        explanation: 'Fallback workflow generated.',
      };
    }
  }
}
