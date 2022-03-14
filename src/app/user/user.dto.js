"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.UpdateUserDto = exports.CreateUserDto = void 0;
var class_validator_1 = require("class-validator");
var CreateUserDto = /** @class */ (function () {
    function CreateUserDto() {
    }
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.MinLength)(5),
        (0, class_validator_1.MaxLength)(32)
    ], CreateUserDto.prototype, "username");
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.MinLength)(5),
        (0, class_validator_1.MaxLength)(32)
    ], CreateUserDto.prototype, "password");
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsEmail)()
    ], CreateUserDto.prototype, "email");
    __decorate([
        (0, class_validator_1.IsOptional)()
    ], CreateUserDto.prototype, "firstName");
    __decorate([
        (0, class_validator_1.IsNotEmpty)()
    ], CreateUserDto.prototype, "lastName");
    __decorate([
        (0, class_validator_1.IsNotEmpty)()
    ], CreateUserDto.prototype, "female");
    return CreateUserDto;
}());
exports.CreateUserDto = CreateUserDto;
var UpdateUserDto = /** @class */ (function () {
    function UpdateUserDto() {
    }
    __decorate([
        (0, class_validator_1.IsOptional)()
    ], UpdateUserDto.prototype, "email");
    __decorate([
        (0, class_validator_1.IsOptional)()
    ], UpdateUserDto.prototype, "firstName");
    __decorate([
        (0, class_validator_1.IsOptional)()
    ], UpdateUserDto.prototype, "lastName");
    __decorate([
        (0, class_validator_1.IsOptional)()
    ], UpdateUserDto.prototype, "avatar");
    __decorate([
        (0, class_validator_1.IsOptional)()
    ], UpdateUserDto.prototype, "female");
    return UpdateUserDto;
}());
exports.UpdateUserDto = UpdateUserDto;
