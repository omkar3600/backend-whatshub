import { AiApprovalService } from './ai-approval.service';
export declare class AiApprovalController {
    private readonly approvalService;
    constructor(approvalService: AiApprovalService);
    getPending(req: any): Promise<({
        contact: {
            name: string;
            phone: string;
        } | null;
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        shopId: string;
        errorMessage: string | null;
        contactId: string | null;
        expiresAt: Date | null;
        toolName: string;
        toolInput: import("@prisma/client/runtime/library").JsonValue;
        riskLevel: string;
        rationale: string;
        approvedBy: string | null;
        reviewedAt: Date | null;
    })[]>;
    approve(id: string, req: any): Promise<{
        success: boolean;
        data: any;
        error: string | undefined;
    }>;
    reject(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
