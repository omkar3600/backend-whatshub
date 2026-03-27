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
export declare class FlowEngineService {
    private prisma;
    private whatsappService;
    private readonly logger;
    constructor(prisma: PrismaService, whatsappService: WhatsappService);
    processIncomingMessage(shopId: string, phone: string, input: string): Promise<boolean>;
    private startFlow;
    private continueFlow;
    private executeNodeChainNative;
    private moveToNextNative;
    private evaluateRouter;
    private matchesInternalRouter;
    private findRootNodeId;
    private resolveContent;
    private saveOutboundMessage;
    processSimulation(flowId: string, input: string | null, definition: FlowDefinition): Promise<SimulationResult>;
    private evaluateCondition;
    private findNextNodeId;
}
