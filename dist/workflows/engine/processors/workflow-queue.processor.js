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
var WorkflowQueueProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowQueueProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const workflow_engine_service_1 = require("../workflow-engine.service");
let WorkflowQueueProcessor = WorkflowQueueProcessor_1 = class WorkflowQueueProcessor extends bullmq_1.WorkerHost {
    workflowEngine;
    logger = new common_1.Logger(WorkflowQueueProcessor_1.name);
    constructor(workflowEngine) {
        super();
        this.workflowEngine = workflowEngine;
    }
    async process(job) {
        const { jobId, instanceId, nodeId } = job.data;
        this.logger.debug(`Processing workflow job: ${jobId}, instance: ${instanceId}, node: ${nodeId}`);
        try {
            await this.workflowEngine.processNode(jobId, instanceId, nodeId);
        }
        catch (error) {
            this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.WorkflowQueueProcessor = WorkflowQueueProcessor;
exports.WorkflowQueueProcessor = WorkflowQueueProcessor = WorkflowQueueProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('workflow-execution-queue', { concurrency: 5 }),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngineService])
], WorkflowQueueProcessor);
//# sourceMappingURL=workflow-queue.processor.js.map