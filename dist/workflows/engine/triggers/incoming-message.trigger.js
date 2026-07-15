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
var IncomingMessageTrigger_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingMessageTrigger = void 0;
const common_1 = require("@nestjs/common");
const workflow_engine_service_1 = require("../workflow-engine.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
let IncomingMessageTrigger = IncomingMessageTrigger_1 = class IncomingMessageTrigger {
    engine;
    prisma;
    type = 'incomingMessage';
    logger = new common_1.Logger(IncomingMessageTrigger_1.name);
    constructor(engine, prisma) {
        this.engine = engine;
        this.prisma = prisma;
    }
    async evaluate(payload) {
        const { shopId, contactId, messageText, messageType } = payload;
        const workflows = await this.prisma.workflow.findMany({
            where: { shopId, status: 'published' },
            include: { versions: { where: { status: 'published' }, take: 1, orderBy: { versionNumber: 'desc' } } }
        });
        for (const workflow of workflows) {
            if (!workflow.versions.length)
                continue;
            const graph = workflow.versions[0].graph;
            const triggerNodes = graph.nodes?.filter((n) => n.type === 'trigger') || [];
            for (const trigger of triggerNodes) {
                if (trigger.data?.triggerType === 'incomingMessage') {
                    const keywords = trigger.data?.keywords;
                    let match = false;
                    if (!keywords) {
                        match = true;
                    }
                    else if (messageType === 'text') {
                        const keywordList = keywords.split(',').map((k) => k.trim().toLowerCase());
                        match = keywordList.some((kw) => messageText?.toLowerCase().includes(kw));
                    }
                    if (match) {
                        this.logger.log(`[Workflow] Trigger matched! Starting workflow ${workflow.id} for contact ${contactId}`);
                        this.engine.startWorkflow(shopId, workflow.id, contactId, {
                            contact: { id: contactId },
                            message: { text: messageText, type: messageType }
                        }).catch(e => this.logger.error(`Failed to start workflow: ${e.message}`));
                    }
                }
            }
        }
    }
};
exports.IncomingMessageTrigger = IncomingMessageTrigger;
exports.IncomingMessageTrigger = IncomingMessageTrigger = IncomingMessageTrigger_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngineService,
        prisma_service_1.PrismaService])
], IncomingMessageTrigger);
//# sourceMappingURL=incoming-message.trigger.js.map