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
    client.join(shopId);
  }

  notifyNewMessage(shopId: string, message: any) {
    this.server.to(shopId).emit('newMessage', message);
  }

  notifyRead(shopId: string, conversationId: string) {
    this.server.to(shopId).emit('read', { conversationId });
  }
}
