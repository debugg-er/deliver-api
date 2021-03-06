import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';

import environment from '@environments';

import { Token } from '@app/account';
import { Repository } from 'typeorm';
import { Conversation, Message, MessageReaction, Participant, User } from '@entities';
import { ModifyContactDto } from '@app/contact';

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
                    .innerJoinAndSelect('p.conversation', 'converastion')
                    .innerJoinAndSelect('p.user', 'u')
                    .where('p.user = :username', { username: user.username })
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
    }

    async handleDisconnect(client: Socket) {
        const { user } = client.handshake.auth;
        if (!user) return;
        await this.userRepository.update(user.username, { isActive: false });
        const payload = { username: user.username, isActive: false };
        this.server.in([...client.rooms]).emit('users-status', payload);
    }

    @SubscribeMessage('share_location')
    async handleSharingLocation(
        client: Socket,
        dto: {
            conversationId: number;
            coordinate: [number, number];
            action: 'update_location' | 'stop_sharing';
        },
    ) {
        const participant = client.handshake.auth.participants.find(
            (p) => p.conversation.id === dto.conversationId,
        ) as Participant;
        if (!participant) return;
        if (participant.conversation.type === 'group') return;

        client.broadcast.to(dto.conversationId.toString()).emit('share_location', {
            participant: participant,
            coordinate: dto.coordinate,
            action: dto.action,
        });
    }

    @OnEvent('message_created')
    async handleMessageCreated(message: Message) {
        await this.participantRepository.update(
            { id: message.participant.id },
            { seenMessageId: message.id, deliveredMessageId: message.id },
        );
        this.server.to(message.participant.conversation.id.toString()).emit('message', message);
    }

    @OnEvent('message_reacted')
    async handleMessageReacted(reaction: MessageReaction) {
        this.server
            .to(reaction.participant.conversation.id.toString())
            .emit('react_message', reaction);
    }

    @OnEvent('message_reaction_deleted')
    async handleMessageReactionDeleted(reaction: MessageReaction) {
        this.server
            .to(reaction.participant.conversation.id.toString())
            .emit('delete_message_reaction', reaction);
    }

    @OnEvent('message_revoked')
    async handleMessageRevoked(message: Message) {
        this.server
            .to(message.participant.conversation.id.toString())
            .emit('revoke_message', message);
    }

    @OnEvent('conversation_created')
    async handleConversationCreated(conversation: Conversation) {
        conversation.participants.forEach((participant) => {
            const socket = this.findSocketByUsername(participant.user.username);
            if (!socket) return;
            participant.conversation = JSON.parse(JSON.stringify(conversation));
            socket.join(conversation.id.toString());
        });
    }

    @OnEvent('participant_added')
    async handleParticipantAdded(participant: Participant) {
        const target = this.findSocketByUsername(participant.user.username);
        if (!target) return;
        target.join(participant.conversation.id.toString());
    }
    @OnEvent('participant_removed')
    async handleParticipantRemoved(participant: Participant) {
        const target = this.findSocketByUsername(participant.user.username);
        if (!target) return;
        target.leave(participant.conversation.id.toString());
    }

    @OnEvent('nickname_changed')
    async handleNicknameChanged(participant: Participant) {
        this.server.to(participant.conversation.id.toString()).emit('change_nickname', participant);
    }

    @OnEvent('contact_modified')
    async handleContactModified(dto: {
        target: User;
        from: User;
        action: ModifyContactDto['action'];
    }) {
        const target = this.findSocketByUsername(dto.target.username);
        const from = this.findSocketByUsername(dto.from.username);
        if (from) {
            from.emit('modify_contact', dto);
        }
        if (target) {
            target.emit('modify_contact', dto);
        }
    }

    @SubscribeMessage('answer_call')
    async handleAnswerCall(
        @MessageBody()
        dto: {
            signal: any;
            from: User;
            to: User;
            input: 'audio' | 'video';
            answer: boolean;
        },
    ) {
        console.log('answer', dto.from.username, dto.to.username);
        const target = this.findSocketByUsername(dto.to.username);
        if (!target) return;
        if (dto.answer) {
            target.emit('call_accepted', dto.signal);
        } else {
            target.emit('call_declined', true);
        }
    }

    @SubscribeMessage('call')
    async handleCall(
        @MessageBody() dto: { signal: any; from: User; to: User; input: 'audio' | 'video' },
    ) {
        console.log('call', dto.from.username, dto.to.username);
        const target = this.findSocketByUsername(dto.to.username);
        if (!target) return;
        target.emit('call', dto);
    }

    findSocketByUsername(username: string): Socket | undefined {
        for (const [, socket] of this.server.sockets.sockets) {
            if (socket.handshake.auth.user?.username === username) {
                return socket;
            }
        }
    }
}
