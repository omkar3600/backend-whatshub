"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("@nestjs/bullmq");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const admin_module_1 = require("./admin/admin.module");
const shops_module_1 = require("./shops/shops.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const contacts_module_1 = require("./contacts/contacts.module");
const conversations_module_1 = require("./conversations/conversations.module");
const messages_module_1 = require("./messages/messages.module");
const chat_module_1 = require("./chat/chat.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const automations_module_1 = require("./automations/automations.module");
const templates_module_1 = require("./templates/templates.module");
const media_module_1 = require("./media/media.module");
const users_module_1 = require("./users/users.module");
const chatbot_module_1 = require("./chatbot/chatbot.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const flows_module_1 = require("./flows/flows.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 120,
                }]),
            prisma_module_1.PrismaModule,
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379', 10),
                    username: process.env.REDIS_USERNAME || 'default',
                    password: process.env.REDIS_PASSWORD || '',
                    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
                },
            }),
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            shops_module_1.ShopsModule,
            whatsapp_module_1.WhatsappModule,
            contacts_module_1.ContactsModule,
            conversations_module_1.ConversationsModule,
            messages_module_1.MessagesModule,
            chat_module_1.ChatModule,
            campaigns_module_1.CampaignsModule,
            automations_module_1.AutomationsModule,
            templates_module_1.TemplatesModule,
            media_module_1.MediaModule,
            users_module_1.UsersModule,
            chatbot_module_1.ChatbotModule,
            flows_module_1.FlowsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map