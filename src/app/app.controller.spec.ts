import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { AppController, LoginDto } from './app.controller';
import { AppService } from './app.service';

const appServiceMock = {
    login: (loginDto) => {
        return { ...loginDto };
    },
};

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                {
                    provide: AppService,
                    useValue: appServiceMock,
                },
            ],
        }).compile();

        appController = app.get<AppController>(AppController);
    });

    describe('root', () => {
        it('should not call service', async () => {
            const loginDto = plainToInstance(LoginDto, { username: 'min', password: 'password' });

            const data = appController.login(loginDto);
            console.log(data);
            // expect(await validate(loginDto)).toHaveLength(0);
        });
    });
});
