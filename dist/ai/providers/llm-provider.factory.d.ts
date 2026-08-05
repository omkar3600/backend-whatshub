import { SystemConfigService } from '../../admin/system-config.service';
import { CryptoService } from '../../common/services/crypto.service';
import { LlmProvider } from './llm-provider.interface';
export declare class LlmProviderFactory {
    private readonly systemConfig;
    private readonly crypto;
    constructor(systemConfig: SystemConfigService, crypto: CryptoService);
    create(chatbotConfig: {
        apiKey?: string | null;
        model?: string | null;
        provider?: string;
    }): Promise<LlmProvider>;
}
