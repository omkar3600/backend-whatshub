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
exports.LlmProviderFactory = void 0;
const common_1 = require("@nestjs/common");
const system_config_service_1 = require("../../admin/system-config.service");
const crypto_service_1 = require("../../common/services/crypto.service");
const groq_provider_1 = require("./groq.provider");
let LlmProviderFactory = class LlmProviderFactory {
    systemConfig;
    crypto;
    constructor(systemConfig, crypto) {
        this.systemConfig = systemConfig;
        this.crypto = crypto;
    }
    async create(chatbotConfig) {
        const provider = chatbotConfig.provider || 'groq';
        const model = chatbotConfig.model || 'llama-3.3-70b-versatile';
        let apiKey;
        if (chatbotConfig.apiKey) {
            try {
                apiKey = this.crypto.decrypt(chatbotConfig.apiKey);
            }
            catch {
                apiKey = chatbotConfig.apiKey;
            }
        }
        else {
            apiKey = await this.systemConfig.get('GROQ_API_KEY', process.env.GROQ_API_KEY) || '';
        }
        if (!apiKey)
            throw new Error('No LLM API key configured. Set GROQ_API_KEY in system settings.');
        if (provider === 'groq') {
            return new groq_provider_1.GroqProvider(apiKey, model);
        }
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
};
exports.LlmProviderFactory = LlmProviderFactory;
exports.LlmProviderFactory = LlmProviderFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [system_config_service_1.SystemConfigService,
        crypto_service_1.CryptoService])
], LlmProviderFactory);
//# sourceMappingURL=llm-provider.factory.js.map