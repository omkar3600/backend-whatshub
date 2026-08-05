import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common";
import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from "../interfaces/node-executor.interface";
import { AgentOrchestratorService } from "../../../ai/orchestrator/agent-orchestrator.service";
import { WhatsappService } from "../../../whatsapp/whatsapp.service";
import { PrismaService } from "../../../prisma/prisma.service";

class AiAgentSchema implements INodeSchema {
  validate(config: any): void {}
  getSchema(): any {
    return {
      type: "object",
      properties: {
        systemPromptOverride: { type: "string" },
        autoSendReply: { type: "boolean" },
        outputVariable: { type: "string" },
      },
    };
  }
}

@Injectable()
export class AiAgentExecutor implements INodeExecutor {
  type = "aiAgent";
  schema = new AiAgentSchema();
  private readonly logger = new Logger(AiAgentExecutor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => AgentOrchestratorService))
    private readonly orchestrator: AgentOrchestratorService,
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappService: WhatsappService,
  ) {}

  async execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult> {
    this.logger.log(`[Workflow Node] Executing AI Agent node for instance ${context.instanceId}`);

    try {
      const contact = await this.prisma.contact.findUnique({
        where: { id: context.contactId },
      });
      if (!contact) throw new Error("Contact not found for workflow execution");

      const conversation = await this.prisma.conversation.findFirst({
        where: { shopId: context.shopId, contactId: context.contactId },
      });

      const messageText = nodeData.userMessage || context.variables.lastMessageText || "Hello";

      // Execute AI ReAct Orchestrator Loop
      const result = await this.orchestrator.run({
        shopId: context.shopId,
        contactId: context.contactId,
        conversationId: conversation?.id || "",
        message: messageText,
      });

      // Save output variable to workflow context
      const varName = nodeData.outputVariable || "aiResponse";
      context.variables[varName] = result.text || "";

      // Auto-send WhatsApp reply if enabled (default: true)
      const autoSend = nodeData.autoSendReply !== false;
      if (autoSend && result.text) {
        this.logger.log(`[Workflow Node] Auto-sending AI response to ${contact.phone}`);
        await this.whatsappService.sendOutboundMessage(context.shopId, contact.phone, "text", result.text);
      }

      return { status: "continue" };
    } catch (error: any) {
      this.logger.error(`[Workflow Node] AI Agent node execution failed: ${error.message}`);
      return { status: "error", error: error.message };
    }
  }
}

