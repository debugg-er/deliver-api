import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';

import environment from '@environments';

import { Token } from '@app/account';
import { UserService } from '@app/user';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly userService: UserService) {}

    @WebSocketServer()
    server: Server;

    async handleConnection(client: Socket) {
        const { token, room } = client.handshake.auth;
        if (token) {
            try {
                const decoded = jwt.verify(token, environment.JWT_SECRET) as Token;
                const user = await this.userService.findUserByUsername(decoded.username);
                await this.userService.updateUser(user.username, { isActive: true });
                client.handshake.auth.user = user;
            } catch (e) {
                console.log(e);
            }
        }
        client.leave(client.id);
        client.join(room);
    }

    @SubscribeMessage('message')
    handleUserSendMessage(client: Socket, message: any): void {
        console.log(client.handshake.auth.user);
        this.server.to([...client.rooms]).emit('broadcast', message);
    }

    async handleDisconnect(client: Socket) {
        await this.userService.updateUser(client.handshake.auth.user.username, { isActive: false });
    }
}
