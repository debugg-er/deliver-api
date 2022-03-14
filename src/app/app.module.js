"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = void 0;
var core_1 = require("@nestjs/core");
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var mailer_1 = require("@nestjs-modules/mailer");
var ormconfig_1 = require("@config/ormconfig");
var mailerconfig_1 = require("@config/mailerconfig");
var _guards_1 = require("@guards");
var _interceptors_1 = require("@interceptors");
var app_controller_1 = require("./app.controller");
var app_service_1 = require("./app.service");
var account_1 = require("./account");
var file_1 = require("./file");
var user_1 = require("./user");
var event_1 = require("./event");
var message_1 = require("./message");
var conversation_1 = require("./conversation");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        (0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forRoot(ormconfig_1["default"]),
                mailer_1.MailerModule.forRoot(mailerconfig_1["default"]),
                account_1.AccountModule,
                user_1.UserModule,
                event_1.EventModule,
                file_1.FileModule,
                message_1.MessageModule,
                conversation_1.ConversationModule,
            ],
            controllers: [app_controller_1.AppController],
            providers: [
                app_service_1.AppService,
                {
                    provide: core_1.APP_PIPE,
                    useValue: new common_1.ValidationPipe({ transform: true, whitelist: true })
                },
                {
                    provide: core_1.APP_GUARD,
                    useClass: _guards_1.AuthorizeGuard
                },
                {
                    provide: core_1.APP_INTERCEPTOR,
                    useClass: _interceptors_1.ErrorsInterceptor
                },
            ]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
