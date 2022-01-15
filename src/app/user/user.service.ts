import { QueryFailedError, Repository } from 'typeorm';
import { PostgresError } from 'pg-error-enum';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '@entities';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    public async findAllUsers(): Promise<Array<User>> {
        return this.userRepository.find();
    }

    public async findUserByUsername(username: string): Promise<User> {
        const user = await this.userRepository.findOne(username);
        if (!user) {
            throw new NotFoundException("username doesn't exist");
        }
        return user;
    }

    public async createUser(dto: CreateUserDto): Promise<User> {
        try {
            const newUser = this.userRepository.create({
                username: dto.username,
                password: dto.password,
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
            });
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

    public async updateUser(username: string, dto: UpdateUserDto): Promise<User> {
        const user = await this.findUserByUsername(username);
        Object.assign(user, dto);
        return await this.userRepository.save(user);
    }
}
