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
    @WebSocketServer()
    server: Server;

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

    async handleConnection(client: Socket) {
        const { token } = client.handshake.auth;
        if (token) {
            try {
                const decoded = jwt.verify(token, environment.JWT_SECRET) as Token;
                const user = await this.userRepository.findOne(decoded.username);
                if (!user) return;
                await this.userRepository.update(user.username, { isActive: true });
                const participants = await this.participantRepository
                    .createQueryBuilder('p')
                    .innerJoinAndSelect('p.conversation', 'c')
                    .innerJoinAndSelect('p.user', 'u')
                    .innerJoinAndSelect('c.participants', 'cp')
                    .innerJoinAndSelect('cp.user', 'cpu')
                    .leftJoinAndSelect('c.lastMessage', 'lm')
                    .leftJoinAndSelect('lm.participant', 'lm_p')
                    .leftJoinAndSelect('lm_p.user', 'lm_u')
                    .andWhere('p.user = :username', {
                        username: user.username,
                    })
                    .getMany();

                const rooms = participants.map((p) => p.conversation.id.toString());
                client.join(rooms);
                const payload = { username: user.username, isActive: true };
                this.server.in(rooms).emit('users-status', payload);

                client.handshake.auth.user = user;
                client.handshake.auth.participants = participants;
            } catch (e) {
                console.log(e);
            }
        }
        client.leave(client.id);
    }

    @SubscribeMessage('message')
    async handleUserSendMessage(
        client: Socket,
        { text, conversationId }: { text: string; conversationId: number },
    ) {
        const participants: Array<Participant> = client.handshake.auth.participants;
        const participant = participants.find((p) => p.conversation.id === conversationId);
        if (!participant) return;

        const message = await this.messageRepository.save(
            this.messageRepository.create({
                content: text,
                participantId: participant.id,
                participant: participant,
            }),
        );
        message.seenParticipants = [participant];
        message.deliveredParticipants = [participant];

        await this.participantRepository.update(
            { id: participant.id },
            { seenMessageId: message.id, deliveredMessageId: message.id },
        );
        client.broadcast.to(conversationId.toString()).emit('message', message);
        return { data: message };
    }

    async handleDisconnect(client: Socket) {
        const { user, participants } = client.handshake.auth;
        if (!user) return;
        await this.userRepository.update(user.username, { isActive: false });
        const rooms = participants.map((p) => p.conversation.id.toString());
        const payload = { username: user.username, isActive: false };
        this.server.in(rooms).emit('users-status', payload);
    }

    findSocketByUsername(username: string): Socket | undefined {
        for (const [, socket] of this.server.sockets.sockets) {
            if (socket.handshake.auth.user?.username === username) {
                return socket;
            }
        }
    }
}
