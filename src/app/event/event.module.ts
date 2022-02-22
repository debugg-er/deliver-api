import { Module } from '@nestjs/common';

import { UserModule } from '@app/user';

import { EventGateway } from './event.gateway';

@Module({
    imports: [UserModule],
    providers: [EventGateway],
})
export class EventModule {}
