import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

export interface RFNode {
    id: string;
    type?: string;
    data: {
        label?: string;
        type: string;
        content?: string;
        config?: any;
        [key: string]: any;
    };
}

export interface RFEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    label?: string;
}

export interface FlowDefinition {
    nodes: RFNode[];
    edges: RFEdge[];
}

export interface SimulationResponse {
    content: string;
    type?: string;
    data?: any;
}

export interface SimulationResult {
    responses: SimulationResponse[];
    currentNodeId: string | null;
    wait: boolean;
}

@Injectable()
export class FlowEngineService {
    private readonly logger = new Logger(FlowEngineService.name);

    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => WhatsappService))
        private whatsappService: WhatsappService
    ) { }

    /**
     * Entry point for real WhatsApp messages.
     * Checks if the message should trigger a flow or continue an existing one.
     * Returns true if a flow was triggered or continued, false otherwise.
     */
    async processIncomingMessage(shopId: string, phone: string, input: string): Promise<boolean> {
        const incomingText = input?.trim() || '';
        const lowerInput = incomingText.toLowerCase();

        // 1. Get contact
        const contact = await this.prisma.contact.findUnique({
            where: { shopId_phone: { shopId, phone } }
        });
        if (!contact) return false;

        // 2. Check for active session
        const existingSession = await this.prisma.flowSession.findUnique({
            where: { contactId: contact.id }
        });

        if (existingSession) {
            // Check if the flow still exists and is active
            const flow = await this.prisma.flow.findFirst({
                where: { id: existingSession.flowId, shopId, status: 'Active' }
            });
            if (flow) {
                this.logger.log(`Continuing flow ${flow.name} for ${phone}`);
                await this.continueFlow(existingSession, flow, incomingText);
                return true;
            } else {
                // Flow was deleted or deactivated, clean up session
                await this.prisma.flowSession.delete({ where: { id: existingSession.id } });
            }
        }

        // 3. Match trigger keyword of ANY active flow
        const activeFlows = await this.prisma.flow.findMany({
            where: { shopId, status: 'Active' }
        });

        // 3a. Global Keyword Trigger (Set on the Flow model)
        const keywordMatch = activeFlows.find(f => {
            if (!f.triggerKeyword) return false;
            const keywords = f.triggerKeyword.split(',').map(k => k.trim().toLowerCase());
            return keywords.some(k => k === lowerInput || (lowerInput.includes(k) && k.length > 3));
        });

        if (keywordMatch) {
            this.logger.log(`Keyword match triggered flow ${keywordMatch.name} for ${phone}`);
            await this.startFlow(contact.id, keywordMatch, incomingText);
            return true;
        }

        // 3b. Dynamic KEYWORD_ROUTER Trigger (Scan internal nodes of all active flows)
        const routerMatch = activeFlows.find(f => this.matchesInternalRouter(f, incomingText));
        if (routerMatch) {
            this.logger.log(`Internal Router match triggered flow ${routerMatch.name} for ${phone}`);
            await this.startFlow(contact.id, routerMatch, incomingText);
            return true;
        }

        // 4. Default flow
        const defaultFlow = activeFlows.find(f => f.isDefault);
        if (defaultFlow) {
            this.logger.log(`Falling back to default flow ${defaultFlow.name} for ${phone}`);
            await this.startFlow(contact.id, defaultFlow, incomingText);
            return true;
        }

        return false;
    }

    private async startFlow(contactId: string, flow: any, input: string) {
        const definition = {
            nodes: (flow.nodes as any) || [],
            edges: (flow.edges as any) || []
        };
        const rootNodeId = this.findRootNodeId(definition);
        if (!rootNodeId) return;

        // Upsert session
        const session = await this.prisma.flowSession.upsert({
            where: { contactId },
            update: {
                flowId: flow.id,
                currentNodeId: rootNodeId,
                variables: { _last_user_message: input }
            },
            create: {
                contactId,
                flowId: flow.id,
                currentNodeId: rootNodeId,
                variables: { _last_user_message: input }
            }
        });

        await this.executeNodeChainNative(rootNodeId, session, definition);
    }

    private async continueFlow(session: any, flow: any, input: string) {
        const definition = {
            nodes: (flow.nodes as any) || [],
            edges: (flow.edges as any) || []
        };
        const currentNodeId = session.currentNodeId;
        if (!currentNodeId) return;

        const currentNode = definition.nodes.find(n => n.id === currentNodeId);
        if (!currentNode) {
            await this.prisma.flowSession.delete({ where: { id: session.id } });
            return;
        }

        const variables = (session.variables as any) || {};
        variables._last_user_message = input;

        // If it was a question, save the answer
        if (currentNode.data.type === 'QUESTION' || currentNode.data.type === 'BUTTON' || currentNode.data.type === 'LIST' || currentNode.data.type === 'INTERACTIVE') {
            const saveAs = currentNode.data.config?.saveAs || currentNode.data.variable || 'user_response';
            if (saveAs) {
                variables[saveAs] = input;
                this.logger.log(`Saved user answer "${input}" to variable "${saveAs}"`);
            }
        }

        // Find next node based on handles or input
        const nextNodeId = this.findNextNodeId(currentNodeId, definition, input);
        if (nextNodeId) {
            session.currentNodeId = nextNodeId;
            session.variables = variables;
            await this.executeNodeChainNative(nextNodeId, session, definition);
        } else {
            // End of flow
            await this.prisma.flowSession.delete({ where: { id: session.id } });
        }
    }

    private async executeNodeChainNative(nodeId: string, session: any, definition: FlowDefinition) {
        const node = definition.nodes.find(n => n.id === nodeId);
        if (!node) return;

        // Track Analytics
        await this.prisma.flowAnalytics.upsert({
            where: { flowId_nodeId: { flowId: session.flowId, nodeId } },
            update: { hits: { increment: 1 } },
            create: { flowId: session.flowId, nodeId, hits: 1 }
        }).catch(err => this.logger.error(`Analytics failed: ${err.message}`));

        // Update session
        await this.prisma.flowSession.update({
            where: { id: session.id },
            data: { currentNodeId: nodeId, variables: session.variables }
        });

        const type = node.data.type;
        this.logger.log(`Native Executing: ${type} (${nodeId})`);

        switch (type) {
            case 'START':
                return this.moveToNextNative(nodeId, session, definition);

            case 'TEXT':
            case 'IMAGE':
            case 'VIDEO':
            case 'AUDIO':
            case 'DOCUMENT':
                const content = this.resolveContent(node.data.content || node.data.text || '', session.variables);
                const mediaUrl = node.data.config?.mediaUrl || node.data.imageUrl || node.data.videoUrl;
                
                // Fetch credentials for sending
                const flow = await this.prisma.flow.findFirst({ where: { id: session.flowId }, select: { shopId: true } });
                const contact = await this.prisma.contact.findFirst({ where: { id: session.contactId } });
                
                if (flow && contact && (content || mediaUrl)) {
                    await this.whatsappService.sendOutboundMessage(flow.shopId, contact.phone, type.toLowerCase(), content, mediaUrl);
                    // Also save to database
                    await this.saveOutboundMessage(flow.shopId, contact.id, type.toLowerCase(), content || 'Media', session.flowId);
                }
                return this.moveToNextNative(nodeId, session, definition);

            case 'BUTTON':
            case 'LIST':
            case 'INTERACTIVE':
            case 'QUESTION':
                // Send the prompt message
                const prompt = this.resolveContent(node.data.content || node.data.text || '', session.variables);
                const f = await this.prisma.flow.findFirst({ where: { id: session.flowId }, select: { shopId: true } });
                const c = await this.prisma.contact.findFirst({ where: { id: session.contactId } });
                
                if (f && c) {
                    if (type === 'INTERACTIVE' || type === 'BUTTON' || type === 'LIST') {
                        // Complex interactive payload
                        const config = node.data.config || {};
                        const payload = {
                            text: prompt,
                            config: config
                        };
                        await this.whatsappService.sendOutboundMessage(f.shopId, c.phone, 'interactive', payload);
                    } else {
                        await this.whatsappService.sendOutboundMessage(f.shopId, c.phone, 'text', prompt);
                    }
                }
                
                // Halt and wait for input
                return;

            case 'CONDITION':
                const branch = this.evaluateCondition(node, session);
                const nextId = this.findNextNodeId(nodeId, definition, branch);
                if (nextId) return this.executeNodeChainNative(nextId, session, definition);
                break;

            case 'KEYWORD_ROUTER':
                const routerBranch = this.evaluateRouter(node, session.variables._last_user_message);
                const routerNextId = this.findNextNodeId(nodeId, definition, routerBranch);
                if (routerNextId) return this.executeNodeChainNative(routerNextId, session, definition);
                break;

            case 'JUMP':
                const targetFlowId = node.data.config?.targetFlowId || node.data.targetFlowId;
                if (targetFlowId) {
                    const targetFlow = await this.prisma.flow.findUnique({ where: { id: targetFlowId } });
                    if (targetFlow && targetFlow.status === 'Active') {
                        return this.startFlow(session.contactId, targetFlow, session.variables._last_user_message);
                    }
                }
                break;

            case 'DELAY':
                const delaySeconds = node.data.config?.delay || node.data.delay || 1;
                // Simple setTimeout for small delays. For production, a worker queue is better.
                setTimeout(() => {
                    this.moveToNextNative(nodeId, session, definition);
                }, delaySeconds * 1000);
                return;

            default:
                return this.moveToNextNative(nodeId, session, definition);
        }

        // If no more nodes, delete session
        await this.prisma.flowSession.delete({ where: { id: session.id } }).catch(() => {});
    }

    private async moveToNextNative(nodeId: string, session: any, definition: FlowDefinition) {
        const nextId = this.findNextNodeId(nodeId, definition, null);
        if (nextId) {
            return this.executeNodeChainNative(nextId, session, definition);
        } else {
            await this.prisma.flowSession.delete({ where: { id: session.id } }).catch(() => {});
        }
    }

    private evaluateRouter(node: RFNode, input: string): string {
        if (!input) return 'fallback';
        const lowerInput = input.trim().toLowerCase();
        const rules = node.data.config?.rules || [];

        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            const type = rule.type; // exact, contains, regex
            const keywords = (rule.keywords || '').split(',').map((k: string) => k.trim().toLowerCase());

            const matched = keywords.some((kw: string) => {
                if (type === 'exact') return lowerInput === kw;
                if (type === 'contains') return lowerInput.includes(kw);
                if (type === 'regex') {
                    try { return new RegExp(kw, 'i').test(lowerInput); } catch { return false; }
                }
                return false;
            });

            if (matched) return `rule-${i}`;
        }
        return 'fallback';
    }

    private matchesInternalRouter(flow: any, input: string): boolean {
        const nodes = (flow.nodes as any[]) || [];
        const routerNode = nodes.find(n => n.data.type === 'KEYWORD_ROUTER');
        if (!routerNode) return false;
        
        const branch = this.evaluateRouter(routerNode, input);
        return branch !== 'fallback';
    }

    private findRootNodeId(definition: FlowDefinition): string | null {
        const startNode = definition.nodes.find(n => n.data.type === 'START');
        if (startNode) return startNode.id;

        // Find node with no incoming edges
        const targets = new Set(definition.edges.map(e => e.target));
        const rootCandidate = definition.nodes.find(n => !targets.has(n.id));
        return rootCandidate?.id || definition.nodes[0]?.id || null;
    }

    private resolveContent(text: string, variables: any): string {
        if (!text) return '';
        return text.replace(/\{\{(.+?)\}\}/g, (_, key) => variables[key.trim()] || `{{${key}}}`);
    }

    private async saveOutboundMessage(shopId: string, contactId: string, type: string, content: string, flowId: string) {
        // Just enough to show in the chat window history
        const conversation = await this.prisma.conversation.findUnique({
            where: { shopId_contactId: { shopId, contactId } }
        });
        if (!conversation) return;

        await this.prisma.message.create({
            data: {
                shopId,
                conversationId: conversation.id,
                direction: 'outbound',
                type,
                content: content || '',
                status: 'sent'
            }
        });
    }

    // --- Original Simulation Logic (Preserved) ---

    async processSimulation(flowId: string, input: string | null, definition: FlowDefinition): Promise<SimulationResult> {
        // Keeping it simple for the user's preview window
        const responses: SimulationResponse[] = [];
        const mockSession = { currentNodeId: null, variables: {} };
        const root = this.findRootNodeId(definition);
        if (!root) return { responses: [], currentNodeId: null, wait: false };
        
        // This is a simplified version of the native logic for quick previews
        const node = definition.nodes.find(n => n.id === root);
        if (node) responses.push({ content: `Simulation: Active at ${node.data.type}`, type: 'text' });
        
        return { responses, currentNodeId: root, wait: true };
    }

    private evaluateCondition(node: RFNode, session: any): string {
        const config = node.data.config || {};
        const variable = config.variable || 'user_response';
        const expected = config.expected || '';
        const conditionType = config.conditionType || 'keyword';

        const actualValue = session.variables[variable] || '';

        let match = false;
        if (conditionType === 'keyword' || conditionType === 'equals') {
            match = String(actualValue).toLowerCase().trim() === String(expected).toLowerCase().trim();
        } else if (conditionType === 'contains') {
            match = String(actualValue).toLowerCase().includes(String(expected).toLowerCase());
        } else if (conditionType === 'not_empty') {
            match = !!actualValue;
        }

        return match ? 'yes' : 'no';
    }

    private findNextNodeId(sourceId: string, definition: FlowDefinition, handle: string | null): string | null {
        const edges: RFEdge[] = definition.edges.filter(e => e.source === sourceId);
        if (edges.length === 0) return null;

        if (handle) {
            const matchedEdge = edges.find(e => e.sourceHandle === handle);
            if (matchedEdge && matchedEdge.target) return matchedEdge.target;

            // Keyword Router handle mapping (rule-X or fallback)
            if (handle.startsWith('rule-') || handle === 'fallback') {
                return (matchedEdge && matchedEdge.target) || (edges[0] && edges[0].target) || null;
            }

            // Button text mapping
            const sourceNode = definition.nodes.find(n => n.id === sourceId);
            if (sourceNode && (sourceNode.data.type === 'INTERACTIVE' || sourceNode.data.type === 'BUTTON')) {
                const buttons = sourceNode.data.config?.buttons || [];
                const btnIndex = buttons.findIndex((b: any) => b.text?.toLowerCase() === handle.trim().toLowerCase());
                if (btnIndex !== -1) {
                    const btnEdge = edges.find(e => e.sourceHandle === `btn-${btnIndex}`);
                    if (btnEdge && btnEdge.target) return btnEdge.target;
                }
            }
        }

        const fallbackEdge = edges[0];
        return fallbackEdge ? fallbackEdge.target : null;
    }
}
