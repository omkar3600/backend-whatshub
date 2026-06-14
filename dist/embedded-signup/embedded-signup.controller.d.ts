import { EmbeddedSignupService } from './embedded-signup.service';
import { SignupCallbackDto } from './dto/signup-callback.dto';
export declare class EmbeddedSignupController {
    private readonly signupService;
    private readonly logger;
    constructor(signupService: EmbeddedSignupService);
    getConfig(): {
        appId: string;
        configId: string;
        scopes: string;
    };
    processCallback(req: any, dto: SignupCallbackDto): Promise<{
        success: boolean;
        message: string;
        wabaAccount: {
            id: any;
            businessName: string | undefined;
            wabaId: string;
            status: string;
        };
        phoneNumbers: {
            phoneNumberId: string;
            displayPhoneNumber: any;
            verifiedName: any;
            qualityRating: any;
        }[];
    }>;
    getConnectionStatus(req: any): Promise<{
        shopId: any;
        isConnected: any;
        accounts: any;
    }>;
    disconnectWaba(req: any, wabaAccountId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    reconnectWaba(req: any, wabaAccountId: string, dto: SignupCallbackDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
