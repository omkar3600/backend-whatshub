import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DebugReport {
  instanceId: string;
  workflowId: string;
  status: string;
  executedPath: { nodeId: string; status: string; durationMs?: number | null; error?: string | null; timestamp: Date }[];
  failureNodeId?: string;
  rootCauseAnalysis: string;
  recommendedAction: string;
}

@Injectable()
export class AiWorkflowDebuggerService {
  constructor(private readonly prisma: PrismaService) {}

  async debugExecution(instanceId: string): Promise<DebugReport> {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        logs: { orderBy: { startedAt: 'asc' } },
        jobs: true,
      },
    });

    if (!instance) {
      throw new Error(`Workflow instance ${instanceId} not found`);
    }

    const path = instance.logs.map(l => ({
      nodeId: l.nodeId,
      status: l.status,
      durationMs: l.durationMs,
      error: l.error,
      timestamp: l.startedAt,
    }));

    const failedLog = instance.logs.find(l => l.status === 'error');
    let rootCause = 'Execution completed successfully without errors.';
    let recommendation = 'No action needed.';

    if (failedLog) {
      rootCause = `Node ${failedLog.nodeId} failed with error: ${failedLog.error || 'Unknown execution error'}`;
      if (failedLog.error?.includes('WhatsApp')) {
        recommendation = '24-hour messaging window expired. Use an approved WhatsApp message template.';
      } else if (failedLog.error?.includes('timeout') || failedLog.error?.includes('API')) {
        recommendation = 'HTTP endpoint timed out or failed. Verify target server availability and retry policy.';
      } else {
        recommendation = 'Check node configuration parameters and variable bindings.';
      }
    }

    return {
      instanceId,
      workflowId: instance.workflowId,
      status: instance.status,
      executedPath: path,
      failureNodeId: failedLog?.nodeId,
      rootCauseAnalysis: rootCause,
      recommendedAction: recommendation,
    };
  }
}
