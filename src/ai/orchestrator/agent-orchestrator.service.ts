import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmProviderFactory } from '../providers/llm-provider.factory';
import { ToolRegistry } from '../tools/registry/tool.registry';
import { ContextBuilderService } from './context-builder.service';
import { LlmMessage } from '../providers/llm-provider.interface';
import { AiTool, ToolContext } from '../tools/tool.interface';

export interface OrchestratorResult {
  text: string | null;
  error?: string;
  toolsUsed: string[];
  actionsQueued: string[]; // tool names queued for approval
}

import { AiPolicyEngineService } from '../policy/ai-policy-engine.service';

@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);
  private static readonly PROMPT_INJECTION_PATTERNS = [
    /ignore (all )?(previous|prior|above) instructions/i,
    /you are now/i,
    /new persona/i,
    /act as (an? )?admin/i,
    /reveal (your )?(system|instructions|prompt)/i,
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmFactory: LlmProviderFactory,
    private readonly toolRegistry: ToolRegistry,
    private readonly contextBuilder: ContextBuilderService,
    private readonly policyEngine: AiPolicyEngineService,
  ) {}

  private sanitizeInput(text: string): string {
    let sanitized = text;
    for (const pattern of AgentOrchestratorService.PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(sanitized)) {
        this.logger.warn(`[Security] Potential prompt injection detected: "${sanitized.slice(0, 80)}"`);
        sanitized = sanitized.replace(pattern, '[message removed]');
      }
    }
    return sanitized;
  }

  async run(opts: {
    shopId: string;
    contactId: string;
    conversationId: string;
    message: string;
  }): Promise<OrchestratorResult> {
    const toolsUsed: string[] = [];
    const actionsQueued: string[] = [];

    // Load chatbot config
    const config = await this.prisma.chatbotConfig.findUnique({ where: { shopId: opts.shopId } });
    if (!config?.isActive) {
      return { text: null, toolsUsed: [], actionsQueued: [] };
    }

    const autonomyLevel = config.autonomyLevel ?? 2;
    const maxIterations = config.maxIterations ?? 8;
    const allowedTools = config.allowedTools as string[] | null;

    let llm: any;
    try {
      llm = await this.llmFactory.create(config);
    } catch (err: any) {
      this.logger.error(`LLM factory error: ${err.message}`);
      return { text: null, error: err.message, toolsUsed: [], actionsQueued: [] };
    }

    // Sanitize customer message
    const sanitizedMessage = this.sanitizeInput(opts.message);

    // If agentMode is false, use simple chatbot mode (no tools)
    if (!config.agentMode) {
      const messages = await this.contextBuilder.build({
        shopId: opts.shopId,
        contactId: opts.contactId,
        conversationId: opts.conversationId,
        systemPrompt: config.systemPrompt || 'You are a helpful customer support assistant.',
        businessInfo: config.businessInfo,
        agentName: config.agentName || 'AI Assistant',
        currentMessage: sanitizedMessage,
      });
      const response = await llm.generateCompletion(messages, [], { temperature: config.temperature });
      return { text: response.content || null, toolsUsed: [], actionsQueued: [] };
    }

    // AGENT MODE: ReAct loop
    const availableTools = this.toolRegistry.getAvailableTools(autonomyLevel, allowedTools);
    const toolDefs = availableTools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    }));

    const messages: LlmMessage[] = await this.contextBuilder.build({
      shopId: opts.shopId,
      contactId: opts.contactId,
      conversationId: opts.conversationId,
      systemPrompt: [
        config.systemPrompt || 'You are a helpful AI business assistant.',
        `\nPersonality: ${config.agentPersonality || 'Professional, friendly, concise.'}`,
        '\nYou have access to tools to help customers and business owners. Use them intelligently.',
        '\nAlways think step by step. If a question is simple, answer directly without tools.',
        '\nIf you cannot help or the issue is complex/emotional, use escalate_to_human.',
      ].join(''),
      businessInfo: config.businessInfo,
      agentName: config.agentName || 'AI Assistant',
      currentMessage: sanitizedMessage,
    });

    const toolCtx: ToolContext = {
      shopId: opts.shopId, // NEVER from LLM
      contactId: opts.contactId,
      conversationId: opts.conversationId,
    };

    const deadline = Date.now() + 25000; // 25 second hard timeout

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      if (Date.now() > deadline) {
        this.logger.warn(`[Agent] Timeout after ${iteration} iterations for shop ${opts.shopId}`);
        break;
      }

      const response = await llm.generateCompletion(messages, toolDefs, { temperature: config.temperature });

      if (response.finishReason === 'stop' || !response.toolCalls.length) {
        // LLM gave a direct text response
        return { text: response.content, toolsUsed, actionsQueued };
      }

      // Process tool calls
      messages.push({ role: 'assistant', content: response.content || '', ...({ tool_calls: response.toolCalls.map(tc => ({ id: tc.id, type: 'function', function: { name: tc.name, arguments: JSON.stringify(tc.arguments) } })) } as any) });

      for (const tc of response.toolCalls) {
        const tool = this.toolRegistry.get(tc.name);
        if (!tool) {
          messages.push({ role: 'tool', content: JSON.stringify({ error: `Tool ${tc.name} not found` }), tool_call_id: tc.id, name: tc.name });
          continue;
        }

        const start = Date.now();
        let toolResult: any;
        let toolSuccess = true;
        let toolError: string | undefined;

        try {
          // Check if this tool needs approval
          const needsApproval = tool.requiresApproval(autonomyLevel);
          if (needsApproval) {
            // Queue for approval instead of executing
            await this.prisma.aiAction.create({
              data: {
                shopId: opts.shopId,
                contactId: opts.contactId || null,
                toolName: tc.name,
                toolInput: tc.arguments,
                riskLevel: tool.riskLevel,
                rationale: `AI wants to ${tool.description.split('.')[0]}`,
                status: 'pending',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
              },
            });
            actionsQueued.push(tc.name);
            toolResult = { queued: true, message: `Action queued for business approval: ${tc.name}` };
          } else {
            // Execute tool directly
            const result = await tool.execute(toolCtx, tc.arguments);
            toolResult = result.data || result;
            toolSuccess = result.success;
            if (!result.success) toolError = result.error;
            toolsUsed.push(tc.name);
          }
        } catch (err: any) {
          toolSuccess = false;
          toolError = err.message;
          toolResult = { error: err.message };
        }

        const durationMs = Date.now() - start;

        // Audit log
        await this.prisma.aiAuditLog.create({
          data: {
            shopId: opts.shopId,
            contactId: opts.contactId || null,
            toolName: tc.name,
            toolInput: tc.arguments,
            toolOutput: toolResult,
            riskLevel: tool.riskLevel,
            success: toolSuccess,
            errorMessage: toolError || null,
            durationMs,
          },
        }).catch(() => {}); // Non-blocking

        messages.push({
          role: 'tool',
          content: JSON.stringify(toolResult),
          tool_call_id: tc.id,
          name: tc.name,
        });
      }
    }

    // Fallback after max iterations
    this.logger.warn(`[Agent] Max iterations reached for shop ${opts.shopId}`);
    return { text: 'I\'m looking into this for you. Please give me a moment.', toolsUsed, actionsQueued };
  }
}
