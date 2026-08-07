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
const axios_1 = require("@nestjs/axios");
const workflows_controller_1 = require("./workflows.controller");
const workflows_service_1 = require("./workflows.service");
const workflow_engine_service_1 = require("./engine/workflow-engine.service");
const workflow_publishing_service_1 = require("./engine/workflow-publishing.service");
const expression_engine_service_1 = require("./engine/expression-engine.service");
const workflow_linter_service_1 = require("./engine/workflow-linter.service");
const node_executor_registry_1 = require("./engine/registries/node-executor.registry");
const trigger_registry_1 = require("./engine/registries/trigger.registry");
const workflow_queue_processor_1 = require("./engine/processors/workflow-queue.processor");
const ai_workflow_generator_service_1 = require("./ai/ai-workflow-generator.service");
const ai_workflow_debugger_service_1 = require("./ai/ai-workflow-debugger.service");
const ai_workflow_simulator_service_1 = require("./ai/ai-workflow-simulator.service");
const ai_workflow_optimizer_service_1 = require("./ai/ai-workflow-optimizer.service");
const ai_copilot_service_1 = require("./ai/ai-copilot.service");
const ai_red_team_service_1 = require("./ai/ai-red-team.service");
const send_message_node_1 = require("./engine/nodes/send-message.node");
const delay_node_1 = require("./engine/nodes/delay.node");
const condition_node_1 = require("./engine/nodes/condition.node");
const wait_reply_node_1 = require("./engine/nodes/wait-reply.node");
const ai_agent_node_1 = require("./engine/nodes/ai-agent.node");
const ask_question_node_1 = require("./engine/nodes/ask-question.node");
const http_request_node_1 = require("./engine/nodes/http-request.node");
const crm_action_node_1 = require("./engine/nodes/crm-action.node");
const ai_intent_router_node_1 = require("./engine/nodes/ai-intent-router.node");
const ab_test_splitter_node_1 = require("./engine/nodes/ab-test-splitter.node");
const data_transform_node_1 = require("./engine/nodes/data-transform.node");
const for_each_node_1 = require("./engine/nodes/for-each.node");
const business_hours_node_1 = require("./engine/nodes/business-hours.node");
const team_handoff_node_1 = require("./engine/nodes/team-handoff.node");
const approval_node_node_1 = require("./engine/nodes/approval-node.node");
const ai_extraction_node_1 = require("./engine/nodes/ai-extraction.node");
const ai_sentiment_node_1 = require("./engine/nodes/ai-sentiment.node");
const sub_workflow_node_1 = require("./engine/nodes/sub-workflow.node");
const ask_input_node_1 = require("./engine/nodes/ask-input.node");
const whatsapp_catalog_node_1 = require("./engine/nodes/whatsapp-catalog.node");
const ecom_order_node_1 = require("./engine/nodes/ecom-order.node");
const ai_goal_agent_node_1 = require("./engine/nodes/ai-goal-agent.node");
const ai_decision_node_1 = require("./engine/nodes/ai-decision.node");
const forward_to_owner_node_1 = require("./engine/nodes/forward-to-owner.node");
const incoming_message_trigger_1 = require("./engine/triggers/incoming-message.trigger");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
const ai_module_1 = require("../ai/ai.module");
let WorkflowsModule = class WorkflowsModule {
    nodeRegistry;
    sendMessageExecutor;
    delayExecutor;
    conditionExecutor;
    waitReplyExecutor;
    aiAgentExecutor;
    askQuestionExecutor;
    httpRequestExecutor;
    crmActionExecutor;
    aiIntentRouterExecutor;
    abTestSplitterExecutor;
    dataTransformExecutor;
    forEachExecutor;
    businessHoursExecutor;
    teamHandoffExecutor;
    approvalExecutor;
    aiExtractionExecutor;
    aiSentimentExecutor;
    subWorkflowExecutor;
    askInputExecutor;
    whatsAppCatalogExecutor;
    ecomOrderExecutor;
    aiGoalAgentExecutor;
    aiDecisionExecutor;
    forwardToOwnerExecutor;
    incomingMessageTrigger;
    triggerRegistry;
    constructor(nodeRegistry, sendMessageExecutor, delayExecutor, conditionExecutor, waitReplyExecutor, aiAgentExecutor, askQuestionExecutor, httpRequestExecutor, crmActionExecutor, aiIntentRouterExecutor, abTestSplitterExecutor, dataTransformExecutor, forEachExecutor, businessHoursExecutor, teamHandoffExecutor, approvalExecutor, aiExtractionExecutor, aiSentimentExecutor, subWorkflowExecutor, askInputExecutor, whatsAppCatalogExecutor, ecomOrderExecutor, aiGoalAgentExecutor, aiDecisionExecutor, forwardToOwnerExecutor, incomingMessageTrigger, triggerRegistry) {
        this.nodeRegistry = nodeRegistry;
        this.sendMessageExecutor = sendMessageExecutor;
        this.delayExecutor = delayExecutor;
        this.conditionExecutor = conditionExecutor;
        this.waitReplyExecutor = waitReplyExecutor;
        this.aiAgentExecutor = aiAgentExecutor;
        this.askQuestionExecutor = askQuestionExecutor;
        this.httpRequestExecutor = httpRequestExecutor;
        this.crmActionExecutor = crmActionExecutor;
        this.aiIntentRouterExecutor = aiIntentRouterExecutor;
        this.abTestSplitterExecutor = abTestSplitterExecutor;
        this.dataTransformExecutor = dataTransformExecutor;
        this.forEachExecutor = forEachExecutor;
        this.businessHoursExecutor = businessHoursExecutor;
        this.teamHandoffExecutor = teamHandoffExecutor;
        this.approvalExecutor = approvalExecutor;
        this.aiExtractionExecutor = aiExtractionExecutor;
        this.aiSentimentExecutor = aiSentimentExecutor;
        this.subWorkflowExecutor = subWorkflowExecutor;
        this.askInputExecutor = askInputExecutor;
        this.whatsAppCatalogExecutor = whatsAppCatalogExecutor;
        this.ecomOrderExecutor = ecomOrderExecutor;
        this.aiGoalAgentExecutor = aiGoalAgentExecutor;
        this.aiDecisionExecutor = aiDecisionExecutor;
        this.forwardToOwnerExecutor = forwardToOwnerExecutor;
        this.incomingMessageTrigger = incomingMessageTrigger;
        this.triggerRegistry = triggerRegistry;
    }
    onModuleInit() {
        this.nodeRegistry.register(this.sendMessageExecutor);
        this.nodeRegistry.register(this.delayExecutor);
        this.nodeRegistry.register(this.conditionExecutor);
        this.nodeRegistry.register(this.waitReplyExecutor);
        this.nodeRegistry.register(this.aiAgentExecutor);
        this.nodeRegistry.register(this.askQuestionExecutor);
        this.nodeRegistry.register(this.httpRequestExecutor);
        this.nodeRegistry.register(this.crmActionExecutor);
        this.nodeRegistry.register(this.aiIntentRouterExecutor);
        this.nodeRegistry.register(this.abTestSplitterExecutor);
        this.nodeRegistry.register(this.dataTransformExecutor);
        this.nodeRegistry.register(this.forEachExecutor);
        this.nodeRegistry.register(this.businessHoursExecutor);
        this.nodeRegistry.register(this.teamHandoffExecutor);
        this.nodeRegistry.register(this.approvalExecutor);
        this.nodeRegistry.register(this.aiExtractionExecutor);
        this.nodeRegistry.register(this.aiSentimentExecutor);
        this.nodeRegistry.register(this.subWorkflowExecutor);
        this.nodeRegistry.register(this.askInputExecutor);
        this.nodeRegistry.register(this.whatsAppCatalogExecutor);
        this.nodeRegistry.register(this.ecomOrderExecutor);
        this.nodeRegistry.register(this.aiGoalAgentExecutor);
        this.nodeRegistry.register(this.aiDecisionExecutor);
        this.nodeRegistry.register(this.forwardToOwnerExecutor);
        this.triggerRegistry.register(this.incomingMessageTrigger);
    }
};
exports.WorkflowsModule = WorkflowsModule;
exports.WorkflowsModule = WorkflowsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            bullmq_1.BullModule.registerQueue({
                name: 'workflow-execution-queue',
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'workflow-dlq',
            }),
            (0, common_1.forwardRef)(() => whatsapp_module_1.WhatsappModule),
            (0, common_1.forwardRef)(() => ai_module_1.AiModule),
        ],
        controllers: [workflows_controller_1.WorkflowsController],
        providers: [
            workflows_service_1.WorkflowsService,
            workflow_engine_service_1.WorkflowEngineService,
            workflow_publishing_service_1.WorkflowPublishingService,
            expression_engine_service_1.ExpressionEngineService,
            workflow_linter_service_1.WorkflowLinterService,
            node_executor_registry_1.NodeExecutorRegistry,
            trigger_registry_1.TriggerRegistry,
            workflow_queue_processor_1.WorkflowQueueProcessor,
            ai_workflow_generator_service_1.AiWorkflowGeneratorService,
            ai_workflow_debugger_service_1.AiWorkflowDebuggerService,
            ai_workflow_simulator_service_1.AiWorkflowSimulatorService,
            ai_workflow_optimizer_service_1.AiWorkflowOptimizerService,
            ai_copilot_service_1.AiCopilotService,
            ai_red_team_service_1.AiRedTeamService,
            send_message_node_1.SendMessageExecutor,
            delay_node_1.DelayExecutor,
            condition_node_1.ConditionExecutor,
            wait_reply_node_1.WaitReplyExecutor,
            ai_agent_node_1.AiAgentExecutor,
            ask_question_node_1.AskQuestionExecutor,
            http_request_node_1.HttpRequestExecutor,
            crm_action_node_1.CrmActionExecutor,
            ai_intent_router_node_1.AiIntentRouterExecutor,
            ab_test_splitter_node_1.AbTestSplitterExecutor,
            data_transform_node_1.DataTransformExecutor,
            for_each_node_1.ForEachExecutor,
            business_hours_node_1.BusinessHoursExecutor,
            team_handoff_node_1.TeamHandoffExecutor,
            approval_node_node_1.ApprovalExecutor,
            ai_extraction_node_1.AiExtractionExecutor,
            ai_sentiment_node_1.AiSentimentExecutor,
            sub_workflow_node_1.SubWorkflowExecutor,
            ask_input_node_1.AskInputExecutor,
            whatsapp_catalog_node_1.WhatsAppCatalogExecutor,
            ecom_order_node_1.EcomOrderExecutor,
            ai_goal_agent_node_1.AiGoalAgentExecutor,
            ai_decision_node_1.AiDecisionExecutor,
            forward_to_owner_node_1.ForwardToOwnerExecutor,
            incoming_message_trigger_1.IncomingMessageTrigger,
        ],
        exports: [
            workflow_engine_service_1.WorkflowEngineService,
            workflow_linter_service_1.WorkflowLinterService,
            trigger_registry_1.TriggerRegistry,
            ai_workflow_generator_service_1.AiWorkflowGeneratorService,
            ai_workflow_debugger_service_1.AiWorkflowDebuggerService,
            ai_workflow_simulator_service_1.AiWorkflowSimulatorService,
            ai_workflow_optimizer_service_1.AiWorkflowOptimizerService,
            ai_copilot_service_1.AiCopilotService,
            ai_red_team_service_1.AiRedTeamService,
        ],
    }),
    __metadata("design:paramtypes", [node_executor_registry_1.NodeExecutorRegistry,
        send_message_node_1.SendMessageExecutor,
        delay_node_1.DelayExecutor,
        condition_node_1.ConditionExecutor,
        wait_reply_node_1.WaitReplyExecutor,
        ai_agent_node_1.AiAgentExecutor,
        ask_question_node_1.AskQuestionExecutor,
        http_request_node_1.HttpRequestExecutor,
        crm_action_node_1.CrmActionExecutor,
        ai_intent_router_node_1.AiIntentRouterExecutor,
        ab_test_splitter_node_1.AbTestSplitterExecutor,
        data_transform_node_1.DataTransformExecutor,
        for_each_node_1.ForEachExecutor,
        business_hours_node_1.BusinessHoursExecutor,
        team_handoff_node_1.TeamHandoffExecutor,
        approval_node_node_1.ApprovalExecutor,
        ai_extraction_node_1.AiExtractionExecutor,
        ai_sentiment_node_1.AiSentimentExecutor,
        sub_workflow_node_1.SubWorkflowExecutor,
        ask_input_node_1.AskInputExecutor,
        whatsapp_catalog_node_1.WhatsAppCatalogExecutor,
        ecom_order_node_1.EcomOrderExecutor,
        ai_goal_agent_node_1.AiGoalAgentExecutor,
        ai_decision_node_1.AiDecisionExecutor,
        forward_to_owner_node_1.ForwardToOwnerExecutor,
        incoming_message_trigger_1.IncomingMessageTrigger,
        trigger_registry_1.TriggerRegistry])
], WorkflowsModule);
//# sourceMappingURL=workflows.module.js.map