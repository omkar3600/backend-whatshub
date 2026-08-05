import { PrismaService } from '../../prisma/prisma.service';
import { ToolRegistry } from '../tools/registry/tool.registry';
export declare class AiApprovalService {
    private readonly prisma;
    private readonly toolRegistry;
    constructor(prisma: PrismaService, toolRegistry: ToolRegistry);
    getPendingActions(shopId: string): Promise<({
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
        toolName: string;
        toolInput: import("@prisma/client/runtime/library").JsonValue;
        riskLevel: string;
        rationale: string;
        approvedBy: string | null;
        reviewedAt: Date | null;
        expiresAt: Date | null;
    })[]>;
    approveAction(actionId: string, shopId: string, userId: string): Promise<{
        success: boolean;
        data: any;
        error: string | undefined;
    }>;
    rejectAction(actionId: string, shopId: string, userId: string): Promise<{
        success: boolean;
    }>;
}
