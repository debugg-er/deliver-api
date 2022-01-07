import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    public async createUser(dto: CreateUserDto): Promise<User> {
        try {
            const newUser = this.userRepository.create({
                username: dto.username,
                password: dto.password,
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
            });

            return this.userRepository.save(newUser);
        } catch (e) {
            console.log(e);
        }
    }
}
