"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Authorize = exports.AuthorizeGuard = void 0;
var jwt = require("jsonwebtoken");
var common_1 = require("@nestjs/common");
var _environments_1 = require("@environments");
var AuthorizeGuard = /** @class */ (function () {
    function AuthorizeGuard(reflector) {
        this.reflector = reflector;
    }
    AuthorizeGuard.prototype.canActivate = function (context) {
        var metadata = this.reflector.get('authorize', context.getHandler());
        if (!metadata)
            return true;
        var req = context.switchToHttp().getRequest();
        var authorization = req.headers.authorization;
        if (!authorization && metadata.require) {
            if (metadata.require) {
                throw new common_1.UnauthorizedException('Not authorized');
            }
            else {
                return true;
            }
        }
        try {
            // prettier-ignore
            var _a = authorization.split(' '), token = _a[1];
            var decoded = jwt.verify(token, _environments_1["default"].JWT_SECRET);
            if (!req.local) {
                req.local = {};
            }
            req.local.auth = decoded;
            return true;
        }
        catch (_b) {
            if (metadata.require) {
                throw new common_1.UnauthorizedException('Not authorized');
            }
            return true;
        }
    };
    AuthorizeGuard = __decorate([
        (0, common_1.Injectable)()
    ], AuthorizeGuard);
    return AuthorizeGuard;
}());
exports.AuthorizeGuard = AuthorizeGuard;
var Authorize = function (option) {
    return (0, common_1.SetMetadata)('authorize', option || { require: true });
};
exports.Authorize = Authorize;
