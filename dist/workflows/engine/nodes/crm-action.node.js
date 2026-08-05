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
var CrmActionExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmActionExecutor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
class CrmActionSchema {
    validate(config) {
        if (!config.actionType) {
            throw new Error('actionType is required for CrmActionNode');
        }
    }
    getSchema() {
        return {
            type: 'object',
            properties: {
                actionType: { type: 'string', enum: ['addTag', 'removeTag', 'updateStage', 'updateNotes'] },
                tag: { type: 'string' },
                leadStage: { type: 'string' },
                noteText: { type: 'string' },
            },
            required: ['actionType'],
        };
    }
}
let CrmActionExecutor = CrmActionExecutor_1 = class CrmActionExecutor {
    prisma;
    type = 'crmAction';
    schema = new CrmActionSchema();
    logger = new common_1.Logger(CrmActionExecutor_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(context, nodeData) {
        this.logger.log(`[Workflow Node] Executing CrmAction (${nodeData.actionType}) for instance ${context.instanceId}`);
        const contact = await this.prisma.contact.findUnique({ where: { id: context.contactId } });
        if (!contact)
            return { status: 'error', error: 'Contact not found' };
        const action = nodeData.actionType;
        if (action === 'addTag' && nodeData.tag) {
            const currentTags = Array.isArray(contact.tags) ? contact.tags : [];
            if (!currentTags.includes(nodeData.tag)) {
                await this.prisma.contact.update({
                    where: { id: contact.id },
                    data: { tags: [...currentTags, nodeData.tag] },
                });
            }
        }
        else if (action === 'removeTag' && nodeData.tag) {
            const currentTags = Array.isArray(contact.tags) ? contact.tags : [];
            await this.prisma.contact.update({
                where: { id: contact.id },
                data: { tags: currentTags.filter((t) => t !== nodeData.tag) },
            });
        }
        else if (action === 'updateStage' && nodeData.leadStage) {
            await this.prisma.contact.update({
                where: { id: contact.id },
                data: { aiLeadStage: nodeData.leadStage },
            });
        }
        else if (action === 'updateNotes' && nodeData.noteText) {
            const updatedNotes = [contact.notes, `[Workflow] ${nodeData.noteText}`].filter(Boolean).join('\n');
            await this.prisma.contact.update({
                where: { id: contact.id },
                data: { notes: updatedNotes },
            });
        }
        return { status: 'continue' };
    }
};
exports.CrmActionExecutor = CrmActionExecutor;
exports.CrmActionExecutor = CrmActionExecutor = CrmActionExecutor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CrmActionExecutor);
//# sourceMappingURL=crm-action.node.js.map