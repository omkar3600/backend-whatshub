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
exports.WorkflowsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const workflows_controller_1 = require("./workflows.controller");
const workflows_service_1 = require("./workflows.service");
const workflow_engine_service_1 = require("./engine/workflow-engine.service");
const expression_engine_service_1 = require("./engine/expression-engine.service");
const node_executor_registry_1 = require("./engine/registries/node-executor.registry");
const trigger_registry_1 = require("./engine/registries/trigger.registry");
const workflow_queue_processor_1 = require("./engine/processors/workflow-queue.processor");
const send_message_node_1 = require("./engine/nodes/send-message.node");
const delay_node_1 = require("./engine/nodes/delay.node");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
let WorkflowsModule = class WorkflowsModule {
    nodeRegistry;
    sendMessageExecutor;
    delayExecutor;
    constructor(nodeRegistry, sendMessageExecutor, delayExecutor) {
        this.nodeRegistry = nodeRegistry;
        this.sendMessageExecutor = sendMessageExecutor;
        this.delayExecutor = delayExecutor;
    }
    onModuleInit() {
        this.nodeRegistry.register(this.sendMessageExecutor);
        this.nodeRegistry.register(this.delayExecutor);
    }
};
exports.WorkflowsModule = WorkflowsModule;
exports.WorkflowsModule = WorkflowsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'workflow-execution-queue',
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'workflow-dlq',
            }),
            whatsapp_module_1.WhatsappModule,
        ],
        controllers: [workflows_controller_1.WorkflowsController],
        providers: [
            workflows_service_1.WorkflowsService,
            workflow_engine_service_1.WorkflowEngineService,
            expression_engine_service_1.ExpressionEngineService,
            node_executor_registry_1.NodeExecutorRegistry,
            trigger_registry_1.TriggerRegistry,
            workflow_queue_processor_1.WorkflowQueueProcessor,
            send_message_node_1.SendMessageExecutor,
            delay_node_1.DelayExecutor,
        ],
        exports: [workflow_engine_service_1.WorkflowEngineService]
    }),
    __metadata("design:paramtypes", [node_executor_registry_1.NodeExecutorRegistry,
        send_message_node_1.SendMessageExecutor,
        delay_node_1.DelayExecutor])
], WorkflowsModule);
//# sourceMappingURL=workflows.module.js.map