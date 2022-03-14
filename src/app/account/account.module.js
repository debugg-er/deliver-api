"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AccountModule = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var jwt_1 = require("@nestjs/jwt");
var _environments_1 = require("@environments");
var _entities_1 = require("@entities");
var account_controller_1 = require("./account.controller");
var account_service_1 = require("./account.service");
var oauth_1 = require("@app/oauth");
var user_1 = require("@app/user");
var AccountModule = /** @class */ (function () {
    function AccountModule() {
    }
    AccountModule = __decorate([
        (0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forFeature([_entities_1.User, _entities_1.Conversation, _entities_1.Participant]),
                jwt_1.JwtModule.register({ secret: _environments_1["default"].JWT_SECRET }),
            ],
            controllers: [account_controller_1.AccountController],
            providers: [account_service_1.AccountService, oauth_1.OAuthService, user_1.UserService]
        })
    ], AccountModule);
    return AccountModule;
}());
exports.AccountModule = AccountModule;
