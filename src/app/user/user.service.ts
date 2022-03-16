import * as fs from 'fs';
import * as path from 'path';
import * as argon2 from 'argon2';
import { QueryFailedError, Repository } from 'typeorm';
import { PostgresError } from 'pg-error-enum';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Participant, User } from '@entities';
import environments from '@environments';

import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Participant)
        private readonly participantRepository: Repository<Participant>,
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

    public async updateUser(username: string, dto: Partial<User>, avatar?: string): Promise<User> {
        if (dto.password) {
            dto.password = await argon2.hash(dto.password);
        }
        let avatarPath: string | undefined = undefined;
        if (avatar) {
            const photoPath = path.join(environments.TEMP_FOLDER_PATH, avatar);
            if (!fs.existsSync(photoPath)) {
                throw new BadRequestException('avatar not found');
            }
            avatarPath = path.join(environments.PUBLIC_FOLDER_PATH, avatar);
            await fs.promises.rename(photoPath, avatarPath);
            avatarPath = '/public/' + avatar;
        }
        const update = await this.userRepository.update({ username }, { ...dto, avatarPath });
        if (update.affected === 0) {
            throw new NotFoundException("Username doesn't exist");
        }
        return this.userRepository.findOne(username) as Promise<User>;
    }
}
