import * as fs from 'fs';
import * as path from 'path';
import * as argon2 from 'argon2';
import { QueryFailedError, Repository } from 'typeorm';
import { PostgresError } from 'pg-error-enum';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Contact, Participant, User } from '@entities';
import { PagingationDto } from '@generals/pagination.dto';
import environments from '@environments';

import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Participant)
        private readonly participantRepository: Repository<Participant>,
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>,
    ) {}

    public async findAllUsers(): Promise<Array<User>> {
        return this.userRepository.find();
    }

    public async findMe(username: string): Promise<any> {
        const user = await this.findUserByUsername(username);
        const [statistic] = await this.userRepository.query(
            `
            SELECT
                SUM(CASE WHEN (status = 'friend') THEN 1 ELSE 0 END)::INT AS friend_count,
                SUM(CASE WHEN (status = 'pending') THEN 1 ELSE 0 END)::INT AS friend_request_count
            FROM contacts
            WHERE user_1 = $1
        `,
            [username],
        );
        return {
            ...user,
            friendCount: statistic.friend_count,
            friendRequestCount: statistic.friend_request_count,
        };
    }

    public async findYouMayKnowns(username: string, pagination: PagingationDto): Promise<any> {
        const releventContacts = await this.contactRepository
            .createQueryBuilder('contact')
            .select('contact.user_1', 'username')
            .addSelect('COUNT(contact.user_2)::INT', 'mutualFriendCount')
            .where(
                (qb) =>
                    'contact.user_2 IN ' +
                    qb
                        .subQuery()
                        .select('c.user_2')
                        .from(Contact, 'c')
                        .where('user_1 = :username', { username })
                        .andWhere('c.status = :status', { status: 'friend' })
                        .getQuery(),
            )
            .andWhere('contact.status = :status', { status: 'friend' })
            .andWhere('contact.user_1 <> :username', { username })
            .andWhere(
                (qb) =>
                    'contact.user_1 NOT IN ' +
                    qb
                        .subQuery()
                        .select('c.user_2')
                        .from(Contact, 'c')
                        .where('user_1 = :username', { username })
                        .andWhere('c.status = :status', { status: 'friend' })
                        .getQuery(),
            )
            .groupBy('contact.user_1')
            .orderBy('COUNT(contact.user_2)', 'DESC')
            .skip(pagination.offset)
            .take(pagination.limit)
            .getRawMany();

        const users = await this.userRepository
            .createQueryBuilder('u')
            .addSelect('contact.status', 'u_status')
            .leftJoin('u.contactsOf', 'contact', 'contact.user_1 = :username', {
                username,
            })
            .where('u.username IN (:...usernames)', {
                usernames: releventContacts.map((c) => c.username),
            })
            .getMany();

        return releventContacts.map((c) => {
            const user = users.find((u) => c.username === u.username);
            if (!user) return;
            user.mutualFriendCount = c.mutualFriendCount;
            return user;
        });
    }

    public async findUserByUsername(username: string): Promise<User> {
        const user = await this.userRepository
            .createQueryBuilder('u')
            .leftJoinAndMapMany('u.friends', 'u.contactUsers', 'cu', 'u_cu.status = :status', {
                status: 'friend',
            })
            .where('u.username = :username', { username })
            .getOne();

        if (!user) {
            throw new NotFoundException("Username doesn't exist");
        }

        return user;
    }

    public async findUsers(
        username: string,
        pagination: PagingationDto,
        query?: string,
    ): Promise<Array<User>> {
        let queryBuilder = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('contact.status', 'user_status')
            .leftJoinAndSelect('user.contactsOf', 'contact', 'contact.user_1 = :username', {
                username,
            })
            .skip(pagination.offset)
            .take(pagination.limit);

        if (query) {
            queryBuilder = queryBuilder.andWhere(
                'LOWER(CONCAT(first_name,last_name)) LIKE :query',
                {
                    query: `%${query}%`,
                },
            );
        }
        return queryBuilder.getMany();
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
                throw new BadRequestException('Avatar not found');
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
