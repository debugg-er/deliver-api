"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.ErrorsInterceptor = void 0;
var common_1 = require("@nestjs/common");
var class_validator_1 = require("class-validator");
var rxjs_1 = require("rxjs");
var ErrorsInterceptor = /** @class */ (function () {
    function ErrorsInterceptor() {
        this.logger = new common_1.Logger(ErrorsInterceptor_1.name);
    }
    ErrorsInterceptor_1 = ErrorsInterceptor;
    ErrorsInterceptor.prototype.intercept = function (context, next) {
        return next.handle().pipe((0, rxjs_1.map)(function (data) { return ({
            statusCode: context.switchToHttp().getResponse().statusCode,
            data: data
        }); }), (0, rxjs_1.catchError)(function (err) {
            console.log(err);
            if (err instanceof common_1.HttpException) {
                throw err;
            }
            if (Array.isArray(err) && err[0] instanceof class_validator_1.ValidationError) {
                throw new common_1.BadRequestException(err.reduce(function (acc, cur) { return __spreadArray(__spreadArray([], acc, true), Object.values(cur.constraints), true); }, []));
            }
            throw new common_1.BadGatewayException();
        }));
    };
    var ErrorsInterceptor_1;
    ErrorsInterceptor = ErrorsInterceptor_1 = __decorate([
        (0, common_1.Injectable)()
    ], ErrorsInterceptor);
    return ErrorsInterceptor;
}());
exports.ErrorsInterceptor = ErrorsInterceptor;
