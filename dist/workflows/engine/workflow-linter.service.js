"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowLinterService = void 0;
const common_1 = require("@nestjs/common");
let WorkflowLinterService = class WorkflowLinterService {
    lintGraph(graph) {
        const issues = [];
        const nodes = graph.nodes || [];
        const edges = graph.edges || [];
        const triggerNode = nodes.find(n => n.type === 'trigger');
        if (!triggerNode) {
            issues.push({
                type: 'error',
                message: 'Workflow has no start trigger node.',
                autoFixAvailable: true,
            });
        }
        for (const node of nodes) {
            if (node.type === 'trigger')
                continue;
            const hasIncoming = edges.some(e => e.target === node.id);
            if (!hasIncoming) {
                issues.push({
                    nodeId: node.id,
                    type: 'warning',
                    message: `Node '${node.data?.label || node.id}' is disconnected and cannot be reached.`,
                    autoFixAvailable: true,
                });
            }
        }
        const terminalTypes = ['sendMessage', 'teamHandoff'];
        for (const node of nodes) {
            if (terminalTypes.includes(node.type))
                continue;
            const hasOutgoing = edges.some(e => e.source === node.id);
            if (!hasOutgoing) {
                issues.push({
                    nodeId: node.id,
                    type: 'info',
                    message: `Node '${node.data?.label || node.id}' has no outgoing connection. Workflow will terminate here.`,
                    autoFixAvailable: false,
                });
            }
        }
        return issues;
    }
};
exports.WorkflowLinterService = WorkflowLinterService;
exports.WorkflowLinterService = WorkflowLinterService = __decorate([
    (0, common_1.Injectable)()
], WorkflowLinterService);
//# sourceMappingURL=workflow-linter.service.js.map