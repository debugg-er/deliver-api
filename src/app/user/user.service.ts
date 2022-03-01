import * as argon2 from 'argon2';
import { QueryFailedError, Repository } from 'typeorm';
import { PostgresError } from 'pg-error-enum';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Conversation, User } from '@entities';

import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
    ) {}

    public async findAllUsers(): Promise<Array<User>> {
        return this.userRepository.find();
    }

    public async findUserByUsername(username: string): Promise<User> {
        const user = await this.userRepository.findOne(username);
        if (!user) {
            throw new NotFoundException("Username doesn't exist");
        }
        return user;
    }

    public async createUser(dto: CreateUserDto): Promise<User> {
        try {
            const newUser = this.userRepository.create(dto);
            newUser.password = await argon2.hash(newUser.password);
            await this.userRepository.insert(newUser);

            return newUser;
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.code === PostgresError.UNIQUE_VIOLATION) {
                    throw new BadRequestException('username is already taken');
                }
            }
            throw err;
        }
    }

    public async updateUser(username: string, dto: Partial<User>): Promise<User> {
        if (dto.password) {
            dto.password = await argon2.hash(dto.password);
        }
        const update = await this.userRepository.update({ username }, dto);
        if (update.affected === 0) {
            throw new NotFoundException("Username doesn't exist");
        }
        return this.userRepository.findOne(username) as Promise<User>;
    }

    public async findUserConversations(username: string): Promise<Array<Conversation>> {
        return this.conversationRepository
            .createQueryBuilder('conversation')
            .leftJoinAndSelect('conversation.participants', 'participant')
            .leftJoinAndSelect('participant.messages', 'message')
            .where('participant.user = :username', { username })
            .andWhere('participant.removedAt IS NULL')
            .orderBy('message.createdAt', 'DESC')
            .getMany();
    }
}
