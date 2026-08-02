import { OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayConnection {
    private readonly logger;
    server: Server;
    handleConnection(client: Socket): void;
    private extractTokenFromCookie;
    handleJoin(shopId: string, client: Socket): void;
    notifyNewMessage(shopId: string, message: any): void;
    notifyRead(shopId: string, conversationId: string): void;
    notifyMessageStatus(shopId: string, data: {
        conversationId: string;
        messageId: string;
        status: string;
    }): void;
}
