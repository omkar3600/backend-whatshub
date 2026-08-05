export interface LintIssue {
    nodeId?: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    autoFixAvailable: boolean;
}
export declare class WorkflowLinterService {
    lintGraph(graph: {
        nodes: any[];
        edges: any[];
    }): LintIssue[];
}
