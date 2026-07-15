"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TriggerRegistry_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerRegistry = void 0;
const common_1 = require("@nestjs/common");
let TriggerRegistry = TriggerRegistry_1 = class TriggerRegistry {
    logger = new common_1.Logger(TriggerRegistry_1.name);
    triggers = new Map();
    register(executor) {
        if (this.triggers.has(executor.type)) {
            this.logger.warn(`Trigger executor for type ${executor.type} is already registered. Overwriting.`);
        }
        this.triggers.set(executor.type, executor);
        this.logger.log(`Registered trigger executor: ${executor.type}`);
    }
    get(type) {
        return this.triggers.get(type);
    }
    getAll() {
        return Array.from(this.triggers.values());
    }
};
exports.TriggerRegistry = TriggerRegistry;
exports.TriggerRegistry = TriggerRegistry = TriggerRegistry_1 = __decorate([
    (0, common_1.Injectable)()
], TriggerRegistry);
//# sourceMappingURL=trigger.registry.js.map