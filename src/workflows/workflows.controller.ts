import { Controller, Post, Body, Param, Get, Put, Delete, Query } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(
    private readonly engineService: WorkflowEngineService,
    private readonly prisma: PrismaService,
    private readonly workflowsService: WorkflowsService,
  ) {}

  @Get()
  async listWorkflows(@Query('shopId') shopId: string) {
    if (!shopId) throw new Error('shopId is required');
    return this.workflowsService.listWorkflows(shopId);
  }

  @Get(':id')
  async getWorkflow(@Query('shopId') shopId: string, @Param('id') id: string) {
    if (!shopId) throw new Error('shopId is required');
    return this.workflowsService.getWorkflow(shopId, id);
  }

  @Post()
  async createWorkflow(@Body() body: { shopId: string; name: string }) {
    if (!body.shopId || !body.name) throw new Error('shopId and name are required');
    return this.workflowsService.createWorkflow(body.shopId, body.name);
  }

  @Put(':id/version')
  async updateWorkflowGraph(
    @Param('id') id: string,
    @Body() body: { shopId: string; graph: any }
  ) {
    if (!body.shopId || !body.graph) throw new Error('shopId and graph are required');
    return this.workflowsService.updateWorkflowGraph(body.shopId, id, body.graph);
  }

  @Post(':id/publish')
  async publishWorkflow(@Param('id') id: string, @Body() body: { shopId: string }) {
    if (!body.shopId) throw new Error('shopId is required');
    return this.workflowsService.publishWorkflow(body.shopId, id);
  }

  @Delete(':id')
  async deleteWorkflow(@Param('id') id: string, @Query('shopId') shopId: string) {
    if (!shopId) throw new Error('shopId is required');
    return this.workflowsService.deleteWorkflow(shopId, id);
  }

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
