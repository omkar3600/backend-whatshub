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
var TeamHandoffExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamHandoffExecutor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
class TeamHandoffSchema {
    validate(config) { }
    getSchema() {
        return {
            type: 'object',
            properties: {
                teamName: { type: 'string' },
                reason: { type: 'string' },
                pauseAi: { type: 'boolean', default: true },
            },
        };
    }
}
let TeamHandoffExecutor = TeamHandoffExecutor_1 = class TeamHandoffExecutor {
    prisma;
    type = 'teamHandoff';
    schema = new TeamHandoffSchema();
    logger = new common_1.Logger(TeamHandoffExecutor_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(context, nodeData) {
        this.logger.log(`[Workflow Node] Executing TeamHandoff for contact ${context.contactId}`);
        if (context.contactId) {
            const conversation = await this.prisma.conversation.findFirst({
                where: { contactId: context.contactId, shopId: context.shopId },
                orderBy: { updatedAt: 'desc' },
            });
            if (conversation) {
                await this.prisma.conversation.update({
                    where: { id: conversation.id },
                    data: { aiPaused: nodeData.pauseAi !== false },
                });
            }
            const note = `[Escalation to ${nodeData.teamName || 'Support'}] Reason: ${nodeData.reason || 'Requested by workflow'}`;
            const contact = await this.prisma.contact.findUnique({ where: { id: context.contactId } });
            const updatedNotes = [contact?.notes, note].filter(Boolean).join('\n');
            await this.prisma.contact.update({
                where: { id: context.contactId },
                data: { notes: updatedNotes },
            });
        }
        this.logger.log(`[TeamHandoff Node] Chat escalated to team: ${nodeData.teamName || 'General Support'}`);
        return { status: 'continue' };
    }
};
exports.TeamHandoffExecutor = TeamHandoffExecutor;
exports.TeamHandoffExecutor = TeamHandoffExecutor = TeamHandoffExecutor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamHandoffExecutor);
//# sourceMappingURL=team-handoff.node.js.map