import { NodeExecutorRegistry } from './registries/node-executor.registry';
export declare class WorkflowPublishingService {
    private readonly nodeRegistry;
    constructor(nodeRegistry: NodeExecutorRegistry);
    validateGraph(graph: any): boolean;
    private hasCircularDependencies;
    private hasUnreachableNodes;
}
