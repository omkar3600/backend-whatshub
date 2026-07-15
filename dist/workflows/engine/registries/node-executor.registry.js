"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NodeExecutorRegistry_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeExecutorRegistry = void 0;
const common_1 = require("@nestjs/common");
let NodeExecutorRegistry = NodeExecutorRegistry_1 = class NodeExecutorRegistry {
    logger = new common_1.Logger(NodeExecutorRegistry_1.name);
    executors = new Map();
    register(executor) {
        if (this.executors.has(executor.type)) {
            this.logger.warn(`Node executor for type ${executor.type} is already registered. Overwriting.`);
        }
        this.executors.set(executor.type, executor);
        this.logger.log(`Registered node executor: ${executor.type}`);
    }
    get(type) {
        return this.executors.get(type);
    }
    getAll() {
        return Array.from(this.executors.values());
    }
};
exports.NodeExecutorRegistry = NodeExecutorRegistry;
exports.NodeExecutorRegistry = NodeExecutorRegistry = NodeExecutorRegistry_1 = __decorate([
    (0, common_1.Injectable)()
], NodeExecutorRegistry);
//# sourceMappingURL=node-executor.registry.js.map