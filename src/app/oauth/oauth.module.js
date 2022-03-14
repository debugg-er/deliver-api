"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.OAuthModule = void 0;
var common_1 = require("@nestjs/common");
var oauth_service_1 = require("./oauth.service");
var OAuthModule = /** @class */ (function () {
    function OAuthModule() {
    }
    OAuthModule = __decorate([
        (0, common_1.Module)({
            providers: [oauth_service_1.OAuthService],
            exports: [oauth_service_1.OAuthService, common_1.Logger]
        })
    ], OAuthModule);
    return OAuthModule;
}());
exports.OAuthModule = OAuthModule;
