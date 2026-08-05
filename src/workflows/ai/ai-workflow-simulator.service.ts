import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SimulationStep {
  nodeId: string;
  nodeType: string;
  simulatedOutput: any;
  status: 'passed' | 'failed' | 'branch_selected';
  branchSelected?: string;
}

@Injectable()
export class AiWorkflowSimulatorService {
  constructor(private readonly prisma: PrismaService) {}

  async simulateWorkflow(shopId: string, workflowId: string, testMessage: string): Promise<{
    success: boolean;
    steps: SimulationStep[];
    finalVariables: Record<string, any>;
  }> {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id: workflowId, shopId },
      include: { versions: { take: 1, orderBy: { versionNumber: 'desc' } } },
    });

    if (!workflow || !workflow.versions.length) {
      return { success: false, steps: [], finalVariables: {} };
    }

    const graph: any = workflow.versions[0].graph;
    const nodes = graph.nodes || [];
    const edges = graph.edges || [];

    const steps: SimulationStep[] = [];
    const variables: Record<string, any> = { testMessage, shopId, simulated: true };

    let currentNode = nodes.find((n: any) => n.type === 'trigger');

    while (currentNode) {
      const stepResult: SimulationStep = {
        nodeId: currentNode.id,
        nodeType: currentNode.type,
        simulatedOutput: { message: `Simulated execution of ${currentNode.type}` },
        status: 'passed',
      };

      if (currentNode.type === 'condition') {
        stepResult.branchSelected = 'true';
      }

      steps.push(stepResult);

      const nextEdges = edges.filter((e: any) => e.source === currentNode.id);
      if (!nextEdges.length) break;

      const targetId = nextEdges[0].target;
      currentNode = nodes.find((n: any) => n.id === targetId);
    }

    return {
      success: true,
      steps,
      finalVariables: variables,
    };
  }
}
