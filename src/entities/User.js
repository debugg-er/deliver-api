"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.User = void 0;
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var User = /** @class */ (function () {
    function User() {
    }
    __decorate([
        (0, typeorm_1.PrimaryColumn)()
    ], User.prototype, "username");
    __decorate([
        (0, typeorm_1.Column)()
    ], User.prototype, "password");
    __decorate([
        (0, typeorm_1.Column)({ name: 'first_name' })
    ], User.prototype, "firstName");
    __decorate([
        (0, typeorm_1.Column)({ name: 'last_name' })
    ], User.prototype, "lastName");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsEmail)()
    ], User.prototype, "email");
    __decorate([
        (0, typeorm_1.Column)({ name: 'is_verified' })
    ], User.prototype, "isVerified");
    __decorate([
        (0, typeorm_1.Column)({ name: 'avatar_path' })
    ], User.prototype, "avatar");
    __decorate([
        (0, typeorm_1.Column)({ name: 'joined_at' })
    ], User.prototype, "joinedAt");
    User = __decorate([
        (0, typeorm_1.Entity)('users')
    ], User);
    return User;
}());
exports.User = User;
