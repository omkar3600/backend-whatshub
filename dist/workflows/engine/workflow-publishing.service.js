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
exports.WorkflowPublishingService = void 0;
const common_1 = require("@nestjs/common");
const node_executor_registry_1 = require("./registries/node-executor.registry");
let WorkflowPublishingService = class WorkflowPublishingService {
    nodeRegistry;
    constructor(nodeRegistry) {
        this.nodeRegistry = nodeRegistry;
    }
    validateGraph(graph) {
        if (!graph || !graph.nodes || !graph.nodes.length) {
            throw new common_1.BadRequestException('Workflow must have at least one node');
        }
        const triggerNodes = graph.nodes.filter((n) => n.type === 'trigger');
        if (triggerNodes.length === 0) {
            throw new common_1.BadRequestException('Workflow must have a trigger node');
        }
        if (triggerNodes.length > 1) {
            throw new common_1.BadRequestException('Workflow can only have one trigger node');
        }
        for (const node of graph.nodes) {
            const executor = this.nodeRegistry.get(node.type);
            if (!executor) {
                throw new common_1.BadRequestException(`Unknown node type: ${node.type}`);
            }
            try {
                executor.schema.validate(node.data || {});
            }
            catch (err) {
                throw new common_1.BadRequestException(`Invalid configuration in node "${node.data?.label || node.id}": ${err.message}`);
            }
        }
        if (this.hasCircularDependencies(graph)) {
            throw new common_1.BadRequestException('Workflow contains circular dependencies (infinite loops)');
        }
        if (this.hasUnreachableNodes(graph)) {
            throw new common_1.BadRequestException('Workflow contains unreachable nodes');
        }
        return true;
    }
    hasCircularDependencies(graph) {
        const adjList = new Map();
        for (const node of graph.nodes) {
            adjList.set(node.id, []);
        }
        for (const edge of graph.edges || []) {
            if (adjList.has(edge.source)) {
                adjList.get(edge.source).push(edge.target);
            }
        }
        const visited = new Set();
        const recStack = new Set();
        const dfs = (nodeId) => {
            if (!visited.has(nodeId)) {
                visited.add(nodeId);
                recStack.add(nodeId);
                const neighbors = adjList.get(nodeId) || [];
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor) && dfs(neighbor)) {
                        return true;
                    }
                    else if (recStack.has(neighbor)) {
                        return true;
                    }
                }
            }
            recStack.delete(nodeId);
            return false;
        };
        for (const node of graph.nodes) {
            if (dfs(node.id)) {
                return true;
            }
        }
        return false;
    }
    hasUnreachableNodes(graph) {
        const triggerNode = graph.nodes.find((n) => n.type === 'trigger');
        if (!triggerNode)
            return false;
        const visited = new Set();
        const queue = [triggerNode.id];
        while (queue.length > 0) {
            const currentId = queue.shift();
            if (!visited.has(currentId)) {
                visited.add(currentId);
                const outEdges = (graph.edges || []).filter((e) => e.source === currentId);
                for (const edge of outEdges) {
                    queue.push(edge.target);
                }
            }
        }
        return visited.size < graph.nodes.length;
    }
};
exports.WorkflowPublishingService = WorkflowPublishingService;
exports.WorkflowPublishingService = WorkflowPublishingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [node_executor_registry_1.NodeExecutorRegistry])
], WorkflowPublishingService);
//# sourceMappingURL=workflow-publishing.service.js.map