import { QueryFailedError, Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Contact, User } from '@entities';
import { FindContactDto, ModifyContactDto } from './contact.dto';
import { PostgresError } from 'pg-error-enum';

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findContacts(username: string, dto: FindContactDto): Promise<Array<User>> {
        let queryBuilder = await this.contactRepository
            .createQueryBuilder('c')
            .innerJoinAndSelect('c.you', 'cu')
            .where({ user1: username, status: dto.status })
            .skip(dto.offset)
            .take(dto.limit);

        if (dto.query) {
            queryBuilder = queryBuilder.andWhere(
                'LOWER(CONCAT(first_name,last_name)) LIKE :query',
                {
                    query: `%${dto.query.replace(/\s+/, '')}%`,
                },
            );
        }

        return (await queryBuilder.getMany()).map((c) => {
            c.you.status = dto.status;
            return c.you;
        });
    }

    async modifyContact(username: string, dto: ModifyContactDto) {
        const contact = await this.contactRepository.findOne({
            user1: username,
            user2: dto.target,
        });
        if (dto.action === 'unfriend' && (!contact || contact.status !== 'friend')) {
            throw new BadRequestException('You are not in the relationship');
        }
        if (dto.action === 'send_request' && contact) {
            switch (contact.status) {
                case 'sent':
                    throw new BadRequestException('Already sent friend request');
                    break;
                case 'pending':
                    throw new BadRequestException('This person is waiting you to accept');
                    break;
                case 'friend':
                    throw new BadRequestException('Already be friend');
                    break;
            }
        }
        if (dto.action === 'accept_request') {
            if (!contact) {
                throw new BadRequestException('Friend request not found');
            } else {
                switch (contact.status) {
                    case 'sent':
                        throw new BadRequestException('Invalid action');
                        break;
                    case 'friend':
                        throw new BadRequestException('Already be friend');
                        break;
                }
            }
        }
        if (dto.action === 'remove_request') {
            if (!contact) {
                throw new BadRequestException('Friend request not found');
            }
            if (contact.status === 'friend') {
                throw new BadRequestException('Already be friend');
            }
        }

        switch (dto.action) {
            case 'accept_request':
                await this.contactRepository.update(
                    { user1: username, user2: dto.target },
                    { status: 'friend' },
                );
                await this.contactRepository.update(
                    { user1: dto.target, user2: username },
                    { status: 'friend' },
                );
                break;

            case 'send_request':
                try {
                    await this.contactRepository.save([
                        this.contactRepository.create({
                            user1: username,
                            user2: dto.target,
                            status: 'sent',
                        }),
                        this.contactRepository.create({
                            user1: dto.target,
                            user2: username,
                            status: 'pending',
                        }),
                    ]);
                    break;
                } catch (err) {
                    if (err instanceof QueryFailedError) {
                        if (err.driverError.code === PostgresError.FOREIGN_KEY_VIOLATION) {
                            throw new BadRequestException('Target is not exists');
                        }
                        if (err.driverError.code === PostgresError.UNIQUE_VIOLATION) {
                            throw new BadRequestException("Can't relation yourself");
                        }
                    }
                    throw err;
                }

            case 'unfriend':
            case 'remove_request':
                await this.contactRepository.delete({
                    user1: username,
                    user2: dto.target,
                });
                await this.contactRepository.delete({
                    user1: dto.target,
                    user2: username,
                });
                break;
        }
    }
}
