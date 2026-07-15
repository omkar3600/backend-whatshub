import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(
    private readonly engineService: WorkflowEngineService,
    private readonly prisma: PrismaService,
  ) {}

  @Post(':id/test-trigger')
  async triggerTestWorkflow(
    @Param('id') id: string,
    @Body() body: { shopId: string, contactId: string }
  ) {
    // Basic endpoint to manually start a workflow instance
    const instance = await this.engineService.startWorkflow(
      body.shopId,
      id,
      body.contactId,
      { source: 'manual-api-test' }
    );
    return { success: true, instanceId: instance.id };
  }

  @Post('create-test-workflow')
  async createTestWorkflow(@Body() body: { shopId: string }) {
    // Creates a dummy workflow for testing
    const workflow = await this.prisma.workflow.create({
      data: {
        shopId: body.shopId,
        name: 'Test Workflow',
        status: 'published',
        versions: {
          create: {
            versionNumber: 1,
            status: 'published',
            graph: {
              nodes: [
                { id: '1', type: 'trigger', data: {} },
                { id: '2', type: 'sendMessage', data: { messageType: 'text', text: 'Hello from Workflow Engine! Time is {{system.now}}' } },
                { id: '3', type: 'delay', data: { delayValue: 5, delayUnit: 'seconds' } },
                { id: '4', type: 'sendMessage', data: { messageType: 'text', text: 'This message comes after 5 seconds delay.' } }
              ],
              edges: [
                { source: '1', target: '2' },
                { source: '2', target: '3' },
                { source: '3', target: '4' }
              ]
            }
          }
        }
      }
    });
    return { success: true, workflowId: workflow.id };
  }
}
