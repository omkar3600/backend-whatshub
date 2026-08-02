import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:3000'],
  },
})
@Injectable()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  handleJoin(@MessageBody() shopId: string, @ConnectedSocket() client: Socket) {
    if (!shopId) return;
    const authShopId = (client.handshake.auth as any)?.shopId || (client.data as any)?.user?.shopId;
    // Allow join if authShopId matches requested shopId or if auth user is admin
    if (authShopId && authShopId !== shopId && (client.data as any)?.user?.role !== 'admin') {
      return;
    }
    client.join(shopId);
  }

  notifyNewMessage(shopId: string, message: any) {
    this.server.to(shopId).emit('newMessage', message);
  }

  notifyRead(shopId: string, conversationId: string) {
    this.server.to(shopId).emit('read', { conversationId });
  }

  notifyMessageStatus(shopId: string, data: { conversationId: string, messageId: string, status: string }) {
    this.server.to(shopId).emit('messageStatusUpdate', data);
  }
}
