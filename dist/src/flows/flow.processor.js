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
var FlowProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const flow_engine_service_1 = require("./flow-engine.service");
const prisma_service_1 = require("../prisma/prisma.service");
let FlowProcessor = FlowProcessor_1 = class FlowProcessor extends bullmq_1.WorkerHost {
    flowEngine;
    prisma;
    logger = new common_1.Logger(FlowProcessor_1.name);
    constructor(flowEngine, prisma) {
        super();
        this.flowEngine = flowEngine;
        this.prisma = prisma;
    }
    async process(job) {
        this.logger.log(`Processing delayed flow step for job ${job.id}`);
        const { nodeId, sessionId, definition, shopId, toPhone } = job.data;
        try {
            const session = await this.prisma.flowSession.findUnique({ where: { id: sessionId } });
            if (!session) {
                this.logger.warn(`Session ${sessionId} not found for delayed job`);
                return;
            }
            await this.flowEngine.moveToNextNative(nodeId, session, definition, shopId, toPhone, 0);
        }
        catch (error) {
            this.logger.error(`Failed to process delayed flow step: ${error.message}`);
            throw error;
        }
    }
};
exports.FlowProcessor = FlowProcessor;
exports.FlowProcessor = FlowProcessor = FlowProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('flow-execution'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [flow_engine_service_1.FlowEngineService,
        prisma_service_1.PrismaService])
], FlowProcessor);
//# sourceMappingURL=flow.processor.js.map