"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequencesModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const sequences_service_1 = require("./sequences.service");
const sequences_controller_1 = require("./sequences.controller");
const sequence_processor_1 = require("./sequence.processor");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
let SequencesModule = class SequencesModule {
};
exports.SequencesModule = SequencesModule;
exports.SequencesModule = SequencesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'sequences',
            }),
            (0, common_1.forwardRef)(() => whatsapp_module_1.WhatsappModule),
        ],
        controllers: [sequences_controller_1.SequencesController],
        providers: [sequences_service_1.SequencesService, sequence_processor_1.SequenceProcessor],
        exports: [sequences_service_1.SequencesService]
    })
], SequencesModule);
//# sourceMappingURL=sequences.module.js.map