import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { Authorize } from '@guards';
import { AuthUser } from '@generals/param.decorator';
import { Token } from '@app/account';

import { ContactService } from './contact.service';
import { FindContactDto, ModifyContactDto } from './contact.dto';

@Controller('contacts')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Get('/')
    @Authorize()
    getContact(@AuthUser() user: Token, @Query() dto: FindContactDto) {
        return this.contactService.findContacts(user.username, dto);
    }

    @Post('/')
    @Authorize()
    async modifyContact(@AuthUser() user: Token, @Body() dto: ModifyContactDto) {
        await this.contactService.modifyContact(user.username, dto);
        return {
            message: 'success',
        };
    }
}
