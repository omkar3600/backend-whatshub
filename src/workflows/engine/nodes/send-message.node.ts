import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext, ExecutionResult, INodeExecutor, INodeSchema } from '../interfaces/node-executor.interface';
import { WhatsappService } from '../../../whatsapp/whatsapp.service';
import { ExpressionEngineService } from '../expression-engine.service';

class SendMessageSchema implements INodeSchema {
  validate(config: any): void {
    if (!config.messageType) {
      throw new Error('messageType is required');
    }
  }
  getSchema(): any {
    return {
      type: 'object',
      properties: {
        messageType: { type: 'string', enum: ['text', 'template'] },
        text: { type: 'string' },
        templateName: { type: 'string' }
      },
      required: ['messageType']
    };
  }
}

@Injectable()
export class SendMessageExecutor implements INodeExecutor {
  type = 'sendMessage';
  schema = new SendMessageSchema();
  private readonly logger = new Logger(SendMessageExecutor.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly expressionEngine: ExpressionEngineService
  ) {}

  async execute(context: ExecutionContext, nodeData: any): Promise<ExecutionResult> {
    this.logger.debug(`Executing SendMessage for instance ${context.instanceId}`);
    
    // Evaluate variables in the text
    let messageContent = nodeData.text || '';
    if (messageContent) {
      messageContent = await this.expressionEngine.evaluateString(messageContent, {
        contact: context.variables.contact,
        workflow: context.variables.workflow,
        system: { now: new Date().toISOString() }
      });
    }

    try {
      if (nodeData.messageType === 'text') {
        // Find phone number for this contact
        // In a real implementation, we'd fetch the Contact's phone and the Shop's default WhatsApp Account
        // For testing, we mock this or call the real service if available.
        this.logger.log(`[WhatsApp API Mock] Sending TEXT to Contact ${context.contactId}: ${messageContent}`);
      } else if (nodeData.messageType === 'template') {
        this.logger.log(`[WhatsApp API Mock] Sending TEMPLATE ${nodeData.templateName} to Contact ${context.contactId}`);
      }
      
      return { status: 'continue' };
    } catch (error: any) {
      this.logger.error(`Failed to send message: ${error.message}`);
      return { status: 'error', error: error.message };
    }
  }
}
