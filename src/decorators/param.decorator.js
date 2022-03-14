"use strict";
exports.__esModule = true;
exports.AuthUser = void 0;
var common_1 = require("@nestjs/common");
exports.AuthUser = (0, common_1.createParamDecorator)(function (data, ctx) {
    var _a;
    var req = ctx.switchToHttp().getRequest();
    return (_a = req.local) === null || _a === void 0 ? void 0 : _a.auth;
});
