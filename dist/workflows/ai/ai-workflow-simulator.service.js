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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiWorkflowSimulatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiWorkflowSimulatorService = class AiWorkflowSimulatorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async simulateWorkflow(shopId, workflowId, testMessage) {
        const workflow = await this.prisma.workflow.findFirst({
            where: { id: workflowId, shopId },
            include: { versions: { take: 1, orderBy: { versionNumber: 'desc' } } },
        });
        if (!workflow || !workflow.versions.length) {
            return { success: false, steps: [], finalVariables: {} };
        }
        const graph = workflow.versions[0].graph;
        const nodes = graph.nodes || [];
        const edges = graph.edges || [];
        const steps = [];
        const variables = { testMessage, shopId, simulated: true };
        let currentNode = nodes.find((n) => n.type === 'trigger');
        while (currentNode) {
            const stepResult = {
                nodeId: currentNode.id,
                nodeType: currentNode.type,
                simulatedOutput: { message: `Simulated execution of ${currentNode.type}` },
                status: 'passed',
            };
            if (currentNode.type === 'condition') {
                stepResult.branchSelected = 'true';
            }
            steps.push(stepResult);
            const nextEdges = edges.filter((e) => e.source === currentNode.id);
            if (!nextEdges.length)
                break;
            const targetId = nextEdges[0].target;
            currentNode = nodes.find((n) => n.id === targetId);
        }
        return {
            success: true,
            steps,
            finalVariables: variables,
        };
    }
};
exports.AiWorkflowSimulatorService = AiWorkflowSimulatorService;
exports.AiWorkflowSimulatorService = AiWorkflowSimulatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiWorkflowSimulatorService);
//# sourceMappingURL=ai-workflow-simulator.service.js.map