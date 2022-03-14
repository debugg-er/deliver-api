import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';

import environment from '@environments';

import { Token } from '@app/account';
import { Repository } from 'typeorm';
import { Conversation, Message, Participant, User } from '@entities';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(Participant)
        private readonly participantRepository: Repository<Participant>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) {}

    @WebSocketServer()
    server: Server;

    async handleConnection(client: Socket) {
        const { token } = client.handshake.auth;
        if (token) {
            try {
                const decoded = jwt.verify(token, environment.JWT_SECRET) as Token;
                const user = await this.userRepository.findOne(decoded.username);
                if (!user) return;
                await this.userRepository.update(user.username, { isActive: true });
                client.handshake.auth.user = user;
            } catch (e) {
                console.log(e);
            }
        }
        client.leave(client.id);
    }

    @SubscribeMessage('join')
    async handleUserJoinConversation(client: Socket, conversationId: number) {
        if (!client.handshake.auth.user) return;
        const participant = await this.participantRepository
            .createQueryBuilder('participant')
            .innerJoinAndSelect('participant.conversation', 'conversation')
            .where('conversation.id = :conversationId', { conversationId })
            .andWhere('participant.user = :username', {
                username: client.handshake.auth.user.username,
            })
            .getOne();

        if (!participant) return;
        participant.user = client.handshake.auth.user;

        client.rooms.forEach((room) => client.leave(room));
        client.handshake.auth.participant = participant;
        client.join(participant.conversation.id.toString());
        console.log(client.rooms);
    }

    @SubscribeMessage('message')
    async handleUserSendMessage(client: Socket, text: string) {
        const { participant } = client.handshake.auth;
        const message = await this.messageRepository.save(
            this.messageRepository.create({
                content: text,
                participantId: participant.id,
                participant: participant,
            }),
        );
        console.log(message);
        console.log(participant.conversation.id.toString());
        this.server.to(participant.conversation.id.toString()).emit('broadcast', message);
    }

    async handleDisconnect(client: Socket) {
        if (!client.handshake.auth.user) return;
        await this.userRepository.update(client.handshake.auth.user.username, { isActive: true });
    }
}
