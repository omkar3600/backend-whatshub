import { Injectable, Logger } from '@nestjs/common';

export interface RFNode {
    id: string;
    type?: string;
    data: {
        label?: string;
        type: string;
        content?: string;
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

export interface SimulationResult {
    messages: string[];
    currentNodeId: string | null;
    wait: boolean;
}

@Injectable()
export class FlowEngineService {
    private readonly logger = new Logger(FlowEngineService.name);

    // Simple in-memory session for simulation
    private sessions = new Map<string, { currentNodeId: string | null; variables: Record<string, any> }>();

    async processSimulation(flowId: string, input: string | null, definition: FlowDefinition): Promise<SimulationResult> {
        let session = this.sessions.get(flowId);
        if (!session || input === 'reset') {
            session = { currentNodeId: null, variables: {} };
            this.sessions.set(flowId, session);
        }

        const messages: string[] = [];
        let currentNodeId = session.currentNodeId;

        if (!currentNodeId) {
            // Find start node
            const startNode = definition.nodes.find(n => n.data.type === 'START');
            currentNodeId = startNode ? startNode.id : (definition.nodes[0]?.id || null);
        } else {
            // If we were waiting for a question, save the input to the variable
            if (session.variables._last_question_var) {
                const varName = session.variables._last_question_var;
                session.variables[varName] = input;
                this.logger.log(`Saved user input "${input}" to variable ${varName}`);
                delete session.variables._last_question_var;
            }

            // Find next node based on input
            currentNodeId = this.findNextNodeId(currentNodeId, definition, input);
        }

        if (!currentNodeId) {
            return { messages: ['Flow ended.'], currentNodeId: null, wait: false };
        }

        return this.executeNodeChain(currentNodeId, session, definition, messages);
    }

    private async executeNodeChain(nodeId: string, session: any, definition: FlowDefinition, messages: string[]): Promise<SimulationResult> {
        const node = definition.nodes.find(n => n.id === nodeId);
        if (!node) return { messages, currentNodeId: null, wait: false };

        session.currentNodeId = nodeId;
        const type = node.data.type;

        this.logger.log(`Processing node: ${nodeId} (${type})`);

        switch (type) {
            case 'START':
                return this.moveToNext(nodeId, session, definition, messages);

            case 'TEXT':
            case 'IMAGE':
            case 'VIDEO':
            case 'AUDIO':
            case 'DOCUMENT':
                if (node.data.content) messages.push(node.data.content);
                if (node.data.text) messages.push(node.data.text);
                return this.moveToNext(nodeId, session, definition, messages);

            case 'QUESTION':
                if (node.data.content) messages.push(node.data.content);
                // Store that we are waiting for an answer to this variable
                if (node.data.variable) {
                    session.variables._last_question_var = node.data.variable;
                }
                return { messages, currentNodeId: nodeId, wait: true };

            case 'CONDITION':
                const branch = this.evaluateCondition(node, session);
                const nextId = this.findNextNodeId(nodeId, definition, branch);
                if (nextId) return this.executeNodeChain(nextId, session, definition, messages);
                return { messages, currentNodeId: nodeId, wait: false };

            case 'DELAY':
                const delayMs = (node.data.delay || 1) * 1000;
                messages.push(`[System: Waiting ${node.data.delay || 1}s]`);
                return this.moveToNext(nodeId, session, definition, messages);

            default:
                this.logger.warn(`Unsupported node type: ${type}`);
                return this.moveToNext(nodeId, session, definition, messages);
        }
    }

    private async moveToNext(nodeId: string, session: any, definition: FlowDefinition, messages: string[]): Promise<SimulationResult> {
        const nextId = this.findNextNodeId(nodeId, definition, null);
        if (nextId) {
            return this.executeNodeChain(nextId, session, definition, messages);
        }
        return { messages, currentNodeId: nodeId, wait: false };
    }

    private evaluateCondition(node: RFNode, session: any): string {
        const config = node.data.config || {};
        const variable = config.variable || 'user_response';
        const expected = config.expected || '';
        const conditionType = config.conditionType || 'keyword';

        const actualValue = session.variables[variable] || session.variables.user_response || '';

        this.logger.log(`Evaluating condition: ${variable} (${actualValue}) ${conditionType} ${expected}`);

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
        // Find edges from this source
        const edges = definition.edges.filter(e => e.source === sourceId);
        
        if (handle) {
            // Match specific handle (used for buttons or conditions)
            const matchedEdge = edges.find(e => e.sourceHandle === handle || e.label?.toLowerCase() === handle.toLowerCase());
            if (matchedEdge) return matchedEdge.target;
        }

        // For QUESTION nodes, if no handle matches, we look for a default "next" edge
        // In React Flow, if there's only one edge and no handle, it's the default path.
        return edges[0]?.target || null;
    }
}
