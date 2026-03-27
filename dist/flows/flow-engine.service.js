"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FlowEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let FlowEngineService = FlowEngineService_1 = class FlowEngineService {
    prisma;
    whatsappService;
    logger = new common_1.Logger(FlowEngineService_1.name);
    constructor(prisma, whatsappService) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
    }
    async processIncomingMessage(shopId, phone, input) {
        const incomingText = input?.trim() || '';
        const lowerInput = incomingText.toLowerCase();
        const contact = await this.prisma.contact.findUnique({
            where: { shopId_phone: { shopId, phone } }
        });
        if (!contact)
            return false;
        const activeFlows = await this.prisma.flow.findMany({
            where: { shopId, status: 'Active' }
        });
        const keywordMatch = activeFlows.find(f => {
            if (!f.triggerKeyword)
                return false;
            const keywords = f.triggerKeyword.split(',').map(k => k.trim().toLowerCase());
            return keywords.some(k => {
                if (k.length <= 3)
                    return lowerInput === k;
                const regex = new RegExp(`(^|\\s)${k}(\\s|$)`, 'i');
                return regex.test(lowerInput);
            });
        });
        if (keywordMatch) {
            this.logger.log(`Keyword match [PRIORITY] triggered flow ${keywordMatch.name} for ${phone}`);
            await this.startFlow(contact.id, keywordMatch, incomingText);
            return true;
        }
        const existingSession = await this.prisma.flowSession.findUnique({
            where: { contactId: contact.id }
        });
        if (existingSession) {
            const isStale = (new Date().getTime() - new Date(existingSession.updatedAt).getTime()) > 24 * 60 * 60 * 1000;
            const flow = activeFlows.find(f => f.id === existingSession.flowId);
            if (flow && !isStale) {
                this.logger.log(`Continuing flow ${flow.name} for ${phone}`);
                await this.continueFlow(existingSession, flow, incomingText);
                return true;
            }
            else {
                this.logger.log(`Cleaning up ${isStale ? 'stale' : 'orphaned'} session for ${phone}`);
                await this.prisma.flowSession.delete({ where: { id: existingSession.id } }).catch(() => { });
            }
        }
        const routerMatch = activeFlows.find(f => {
            const hasRouter = f.nodes?.some(n => n.data.type === 'KEYWORD_ROUTER');
            if (!hasRouter)
                return false;
            return this.matchesInternalRouter(f, incomingText);
        });
        if (routerMatch) {
            this.logger.log(`Internal Router match triggered flow ${routerMatch.name} for ${phone}`);
            await this.startFlow(contact.id, routerMatch, incomingText);
            return true;
        }
        const defaultFlow = activeFlows.find(f => f.isDefault);
        if (defaultFlow) {
            this.logger.log(`Falling back to default flow ${defaultFlow.name} for ${phone}`);
            await this.startFlow(contact.id, defaultFlow, incomingText);
            return true;
        }
        return false;
    }
    async startFlow(contactId, flow, input) {
        const definition = {
            nodes: flow.nodes || [],
            edges: flow.edges || []
        };
        const rootNodeId = this.findRootNodeId(definition);
        if (!rootNodeId)
            return;
        const contact = await this.prisma.contact.findUnique({ where: { id: contactId }, select: { phone: true } });
        if (!contact)
            return;
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
        await this.executeNodeChainNative(rootNodeId, session, definition, flow.shopId, contact.phone, 0);
    }
    async continueFlow(session, flow, input) {
        const definition = {
            nodes: flow.nodes || [],
            edges: flow.edges || []
        };
        const currentNodeId = session.currentNodeId;
        if (!currentNodeId)
            return;
        const currentNode = definition.nodes.find(n => n.id === currentNodeId);
        if (!currentNode) {
            await this.prisma.flowSession.delete({ where: { id: session.id } });
            return;
        }
        const contact = await this.prisma.contact.findUnique({ where: { id: session.contactId }, select: { phone: true } });
        if (!contact)
            return;
        const variables = session.variables || {};
        variables._last_user_message = input;
        const type = currentNode.data.type;
        if (type === 'QUESTION' || type === 'BUTTON' || type === 'LIST' || type === 'INTERACTIVE') {
            const saveAs = currentNode.data.config?.saveAs || currentNode.data.variable || 'user_response';
            if (saveAs) {
                variables[saveAs] = input;
                this.logger.log(`Saved user answer "${input}" to variable "${saveAs}"`);
            }
        }
        const nextNodeId = this.findNextNodeId(currentNodeId, definition, input);
        if (nextNodeId) {
            session.currentNodeId = nextNodeId;
            session.variables = variables;
            await this.executeNodeChainNative(nextNodeId, session, definition, flow.shopId, contact.phone, 0);
        }
        else {
            await this.prisma.flowSession.delete({ where: { id: session.id } }).catch(() => { });
        }
    }
    async executeNodeChainNative(nodeId, session, definition, shopId, toPhone, depth) {
        if (depth > 20) {
            this.logger.error(`Flow recursion limit reached for session ${session.id}. Possible infinite loop.`);
            return;
        }
        const node = definition.nodes.find(n => n.id === nodeId);
        if (!node)
            return;
        this.prisma.flowAnalytics.upsert({
            where: { flowId_nodeId: { flowId: session.flowId, nodeId } },
            update: { hits: { increment: 1 } },
            create: { flowId: session.flowId, nodeId, hits: 1 }
        }).catch(err => this.logger.error(`Analytics failed: ${err.message}`));
        await this.prisma.flowSession.update({
            where: { id: session.id },
            data: { currentNodeId: nodeId, variables: session.variables }
        });
        const type = node.data.type;
        this.logger.log(`Native Executing [${depth}]: ${type} (${nodeId})`);
        switch (type) {
            case 'START':
                return this.moveToNextNative(nodeId, session, definition, shopId, toPhone, depth + 1);
            case 'TEXT':
            case 'IMAGE':
            case 'VIDEO':
            case 'AUDIO':
            case 'DOCUMENT':
                const content = this.resolveContent(node.data.content || node.data.text || '', session.variables);
                const mediaUrl = node.data.config?.mediaUrl || node.data.imageUrl || node.data.videoUrl;
                if (content || mediaUrl) {
                    await this.whatsappService.sendOutboundMessage(shopId, toPhone, type.toLowerCase(), content, mediaUrl);
                    this.saveOutboundMessage(shopId, session.contactId, type.toLowerCase(), content || 'Media', session.flowId);
                }
                return this.moveToNextNative(nodeId, session, definition, shopId, toPhone, depth + 1);
            case 'BUTTON':
            case 'LIST':
            case 'INTERACTIVE':
            case 'QUESTION':
                const prompt = this.resolveContent(node.data.content || node.data.text || '', session.variables);
                if (type === 'INTERACTIVE' || type === 'BUTTON' || type === 'LIST') {
                    const config = node.data.config || {};
                    const payload = { text: prompt, config: config };
                    await this.whatsappService.sendOutboundMessage(shopId, toPhone, 'interactive', payload);
                }
                else {
                    await this.whatsappService.sendOutboundMessage(shopId, toPhone, 'text', prompt);
                }
                return;
            case 'CONDITION':
                const branch = this.evaluateCondition(node, session);
                const nextId = this.findNextNodeId(nodeId, definition, branch);
                if (nextId)
                    return this.executeNodeChainNative(nextId, session, definition, shopId, toPhone, depth + 1);
                break;
            case 'KEYWORD_ROUTER':
                const routerBranch = this.evaluateRouter(node, session.variables._last_user_message);
                const routerNextId = this.findNextNodeId(nodeId, definition, routerBranch);
                if (routerNextId)
                    return this.executeNodeChainNative(routerNextId, session, definition, shopId, toPhone, depth + 1);
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
                this.logger.log(`Halted for ${delaySeconds}s delay...`);
                setTimeout(() => {
                    this.moveToNextNative(nodeId, session, definition, shopId, toPhone, depth + 1);
                }, delaySeconds * 1000);
                return;
            default:
                return this.moveToNextNative(nodeId, session, definition, shopId, toPhone, depth + 1);
        }
        await this.prisma.flowSession.delete({ where: { id: session.id } }).catch(() => { });
    }
    async moveToNextNative(nodeId, session, definition, shopId, toPhone, depth) {
        const nextId = this.findNextNodeId(nodeId, definition, null);
        if (nextId) {
            return this.executeNodeChainNative(nextId, session, definition, shopId, toPhone, depth);
        }
        else {
            await this.prisma.flowSession.delete({ where: { id: session.id } }).catch(() => { });
        }
    }
    evaluateRouter(node, input) {
        if (!input)
            return 'fallback';
        const lowerInput = input.trim().toLowerCase();
        const rules = node.data.config?.rules || [];
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            const type = rule.type;
            const keywords = (rule.keywords || '').split(',').map((k) => k.trim().toLowerCase());
            const matched = keywords.some((kw) => {
                if (type === 'exact')
                    return lowerInput === kw;
                if (type === 'contains')
                    return lowerInput.includes(kw);
                if (type === 'regex') {
                    try {
                        return new RegExp(kw, 'i').test(lowerInput);
                    }
                    catch {
                        return false;
                    }
                }
                return false;
            });
            if (matched)
                return `rule-${i}`;
        }
        return 'fallback';
    }
    matchesInternalRouter(flow, input) {
        const nodes = flow.nodes || [];
        const routerNode = nodes.find(n => n.data.type === 'KEYWORD_ROUTER');
        if (!routerNode)
            return false;
        const branch = this.evaluateRouter(routerNode, input);
        return branch !== 'fallback';
    }
    findRootNodeId(definition) {
        const startNode = definition.nodes.find(n => n.data.type === 'START');
        if (startNode)
            return startNode.id;
        const targets = new Set(definition.edges.map(e => e.target));
        const rootCandidate = definition.nodes.find(n => !targets.has(n.id));
        return rootCandidate?.id || definition.nodes[0]?.id || null;
    }
    resolveContent(text, variables) {
        if (!text)
            return '';
        return text.replace(/\{\{(.+?)\}\}/g, (_, key) => variables[key.trim()] || `{{${key}}}`);
    }
    async saveOutboundMessage(shopId, contactId, type, content, flowId) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { shopId_contactId: { shopId, contactId } }
        });
        if (!conversation)
            return;
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
    async processSimulation(flowId, input, definition) {
        const responses = [];
        const mockSession = { currentNodeId: null, variables: {} };
        const root = this.findRootNodeId(definition);
        if (!root)
            return { responses: [], currentNodeId: null, wait: false };
        const node = definition.nodes.find(n => n.id === root);
        if (node)
            responses.push({ content: `Simulation: Active at ${node.data.type}`, type: 'text' });
        return { responses, currentNodeId: root, wait: true };
    }
    evaluateCondition(node, session) {
        const config = node.data.config || {};
        const variable = config.variable || 'user_response';
        const expected = config.expected || '';
        const conditionType = config.conditionType || 'keyword';
        const actualValue = session.variables[variable] || '';
        let match = false;
        if (conditionType === 'keyword' || conditionType === 'equals') {
            match = String(actualValue).toLowerCase().trim() === String(expected).toLowerCase().trim();
        }
        else if (conditionType === 'contains') {
            match = String(actualValue).toLowerCase().includes(String(expected).toLowerCase());
        }
        else if (conditionType === 'not_empty') {
            match = !!actualValue;
        }
        return match ? 'yes' : 'no';
    }
    findNextNodeId(sourceId, definition, handle) {
        const edges = definition.edges.filter(e => e.source === sourceId);
        if (edges.length === 0)
            return null;
        if (handle) {
            const matchedEdge = edges.find(e => e.sourceHandle === handle);
            if (matchedEdge && matchedEdge.target)
                return matchedEdge.target;
            if (handle.startsWith('rule-') || handle === 'fallback') {
                return (matchedEdge && matchedEdge.target) || (edges[0] && edges[0].target) || null;
            }
            const sourceNode = definition.nodes.find(n => n.id === sourceId);
            if (sourceNode && (sourceNode.data.type === 'INTERACTIVE' || sourceNode.data.type === 'BUTTON')) {
                const buttons = sourceNode.data.config?.buttons || [];
                const btnIndex = buttons.findIndex((b) => b.text?.toLowerCase() === handle.trim().toLowerCase());
                if (btnIndex !== -1) {
                    const btnEdge = edges.find(e => e.sourceHandle === `btn-${btnIndex}`);
                    if (btnEdge && btnEdge.target)
                        return btnEdge.target;
                }
            }
        }
        const fallbackEdge = edges[0];
        return fallbackEdge ? fallbackEdge.target : null;
    }
};
exports.FlowEngineService = FlowEngineService;
exports.FlowEngineService = FlowEngineService = FlowEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => whatsapp_service_1.WhatsappService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], FlowEngineService);
//# sourceMappingURL=flow-engine.service.js.map