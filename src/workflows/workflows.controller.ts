import { Controller, Post, Body, Param, Get, Put, Delete, Query, BadRequestException } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiWorkflowGeneratorService } from './ai/ai-workflow-generator.service';
import { AiWorkflowDebuggerService } from './ai/ai-workflow-debugger.service';
import { AiWorkflowSimulatorService } from './ai/ai-workflow-simulator.service';
import { AiWorkflowOptimizerService } from './ai/ai-workflow-optimizer.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(
    private readonly engineService: WorkflowEngineService,
    private readonly prisma: PrismaService,
    private readonly workflowsService: WorkflowsService,
    private readonly generatorService: AiWorkflowGeneratorService,
    private readonly debuggerService: AiWorkflowDebuggerService,
    private readonly simulatorService: AiWorkflowSimulatorService,
    private readonly optimizerService: AiWorkflowOptimizerService,
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
    if (!body.shopId || !body.name) {
      throw new BadRequestException('shopId and name are required');
    }
    try {
      return await this.workflowsService.createWorkflow(body.shopId, body.name);
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw new BadRequestException(error.message || 'Failed to create workflow');
    }
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

  @Post('ai/generate')
  async generateWorkflow(@Body() body: { shopId: string; prompt: string }) {
    if (!body.shopId || !body.prompt) throw new BadRequestException('shopId and prompt are required');
    return this.generatorService.generateGraphFromPrompt(body.shopId, body.prompt);
  }

  @Get('ai/debug/:instanceId')
  async debugWorkflow(@Param('instanceId') instanceId: string) {
    return this.debuggerService.debugExecution(instanceId);
  }

  @Post('ai/simulate')
  async simulateWorkflow(@Body() body: { shopId: string; workflowId: string; testMessage: string }) {
    if (!body.shopId || !body.workflowId) throw new BadRequestException('shopId and workflowId are required');
    return this.simulatorService.simulateWorkflow(body.shopId, body.workflowId, body.testMessage || 'Test');
  }

  @Get('ai/optimize/:id')
  async optimizeWorkflow(@Param('id') id: string) {
    return this.optimizerService.analyzeAndOptimize(id);
  }

  @Post(':id/test-trigger')
  async triggerTestWorkflow(
    @Param('id') id: string,
    @Body() body: { shopId: string, contactId: string }
  ) {
    const instance = await this.engineService.startWorkflow(
      body.shopId,
      id,
      body.contactId,
      { source: 'manual-api-test' }
    );
    return { success: true, instanceId: instance.id };
  }
}
