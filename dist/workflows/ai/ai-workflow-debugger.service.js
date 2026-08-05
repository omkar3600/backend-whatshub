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
exports.AiWorkflowDebuggerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiWorkflowDebuggerService = class AiWorkflowDebuggerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async debugExecution(instanceId) {
        const instance = await this.prisma.workflowInstance.findUnique({
            where: { id: instanceId },
            include: {
                logs: { orderBy: { startedAt: 'asc' } },
                jobs: true,
            },
        });
        if (!instance) {
            throw new Error(`Workflow instance ${instanceId} not found`);
        }
        const path = instance.logs.map(l => ({
            nodeId: l.nodeId,
            status: l.status,
            durationMs: l.durationMs,
            error: l.error,
            timestamp: l.startedAt,
        }));
        const failedLog = instance.logs.find(l => l.status === 'error');
        let rootCause = 'Execution completed successfully without errors.';
        let recommendation = 'No action needed.';
        if (failedLog) {
            rootCause = `Node ${failedLog.nodeId} failed with error: ${failedLog.error || 'Unknown execution error'}`;
            if (failedLog.error?.includes('WhatsApp')) {
                recommendation = '24-hour messaging window expired. Use an approved WhatsApp message template.';
            }
            else if (failedLog.error?.includes('timeout') || failedLog.error?.includes('API')) {
                recommendation = 'HTTP endpoint timed out or failed. Verify target server availability and retry policy.';
            }
            else {
                recommendation = 'Check node configuration parameters and variable bindings.';
            }
        }
        return {
            instanceId,
            workflowId: instance.workflowId,
            status: instance.status,
            executedPath: path,
            failureNodeId: failedLog?.nodeId,
            rootCauseAnalysis: rootCause,
            recommendedAction: recommendation,
        };
    }
};
exports.AiWorkflowDebuggerService = AiWorkflowDebuggerService;
exports.AiWorkflowDebuggerService = AiWorkflowDebuggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiWorkflowDebuggerService);
//# sourceMappingURL=ai-workflow-debugger.service.js.map