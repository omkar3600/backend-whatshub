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
var HttpRequestExecutor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequestExecutor = void 0;
const common_1 = require("@nestjs/common");
const expression_engine_service_1 = require("../expression-engine.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
class HttpRequestSchema {
    validate(config) {
        if (!config.url) {
            throw new Error('url is required for HttpRequestNode');
        }
    }
    getSchema() {
        return {
            type: 'object',
            properties: {
                method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
                url: { type: 'string' },
                headersJson: { type: 'string' },
                bodyJson: { type: 'string' },
                outputVariable: { type: 'string' },
            },
            required: ['url'],
        };
    }
}
let HttpRequestExecutor = HttpRequestExecutor_1 = class HttpRequestExecutor {
    expressionEngine;
    httpService;
    type = 'httpRequest';
    schema = new HttpRequestSchema();
    logger = new common_1.Logger(HttpRequestExecutor_1.name);
    constructor(expressionEngine, httpService) {
        this.expressionEngine = expressionEngine;
        this.httpService = httpService;
    }
    async execute(context, nodeData) {
        this.logger.log(`[Workflow Node] Executing HttpRequest for instance ${context.instanceId}`);
        try {
            const evalCtx = {
                contact: context.variables.contact || {},
                variables: context.variables,
                workflow: context.variables.workflow || {},
            };
            const method = (nodeData.method || 'GET').toUpperCase();
            const rawUrl = nodeData.url || '';
            const interpolatedUrl = await this.expressionEngine.evaluateString(rawUrl, evalCtx);
            let headers = {};
            if (nodeData.headersJson) {
                try {
                    const evalHeaders = await this.expressionEngine.evaluateString(nodeData.headersJson, evalCtx);
                    headers = JSON.parse(evalHeaders);
                }
                catch (e) {
                    this.logger.warn(`Failed to parse headers JSON: ${e.message}`);
                }
            }
            let data = undefined;
            if (['POST', 'PUT', 'PATCH'].includes(method) && nodeData.bodyJson) {
                try {
                    const evalBody = await this.expressionEngine.evaluateString(nodeData.bodyJson, evalCtx);
                    data = JSON.parse(evalBody);
                }
                catch {
                    data = nodeData.bodyJson;
                }
            }
            this.logger.log(`[Workflow HTTP] ${method} ${interpolatedUrl}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.request({
                method,
                url: interpolatedUrl,
                headers,
                data,
                timeout: 10000,
            }));
            const varName = nodeData.outputVariable || 'apiResponse';
            context.variables[varName] = response.data;
            return { status: 'continue', branch: 'success' };
        }
        catch (error) {
            this.logger.error(`[Workflow HTTP Error] ${error.message}`);
            const varName = nodeData.outputVariable || 'apiResponse';
            context.variables[varName] = { error: error.message, status: error.response?.status };
            return { status: 'continue', branch: 'error' };
        }
    }
};
exports.HttpRequestExecutor = HttpRequestExecutor;
exports.HttpRequestExecutor = HttpRequestExecutor = HttpRequestExecutor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [expression_engine_service_1.ExpressionEngineService,
        axios_1.HttpService])
], HttpRequestExecutor);
//# sourceMappingURL=http-request.node.js.map