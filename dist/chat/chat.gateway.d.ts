import { Server, Socket } from 'socket.io';
export declare class ChatGateway {
    server: Server;
    handleJoin(shopId: string, client: Socket): void;
    notifyNewMessage(shopId: string, message: any): void;
    notifyRead(shopId: string, conversationId: string): void;
}
