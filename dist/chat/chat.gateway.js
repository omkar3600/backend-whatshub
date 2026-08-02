"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
let ChatGateway = ChatGateway_1 = class ChatGateway {
    logger = new common_1.Logger(ChatGateway_1.name);
    server;
    handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '') ||
                this.extractTokenFromCookie(client.handshake.headers?.cookie);
            if (token) {
                const secret = process.env.JWT_SECRET || 'default_secret';
                const decoded = jwt.verify(token, secret);
                client.data.user = {
                    id: decoded.sub,
                    shopId: decoded.shopId,
                    role: decoded.role,
                };
            }
        }
        catch (err) {
            this.logger.debug(`Socket authentication failed: ${err.message}`);
        }
    }
    extractTokenFromCookie(cookieHeader) {
        if (!cookieHeader)
            return null;
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});
        return cookies['token'] || null;
    }
    handleJoin(shopId, client) {
        if (!shopId)
            return;
        const user = client.data?.user;
        if (!user) {
            this.logger.warn(`Unauthenticated socket tried to join room ${shopId}`);
            return;
        }
        if (user.role !== 'admin' && user.shopId !== shopId) {
            this.logger.warn(`Unauthorized socket join attempt by shopId=${user.shopId} to target shopId=${shopId}`);
            return;
        }
        client.join(shopId);
        this.logger.log(`Socket ${client.id} joined room ${shopId}`);
    }
    notifyNewMessage(shopId, message) {
        this.server.to(shopId).emit('newMessage', message);
    }
    notifyRead(shopId, conversationId) {
        this.server.to(shopId).emit('read', { conversationId });
    }
    notifyMessageStatus(shopId, data) {
        this.server.to(shopId).emit('messageStatusUpdate', data);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoin", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    (0, common_1.Injectable)()
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map