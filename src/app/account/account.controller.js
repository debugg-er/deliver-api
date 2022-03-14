"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.AccountController = void 0;
var common_1 = require("@nestjs/common");
var _environments_1 = require("@environments");
var _guards_1 = require("@guards");
var _decorators_1 = require("@decorators");
var AccountController = /** @class */ (function () {
    function AccountController(userService, accountService, oAuthService) {
        this.userService = userService;
        this.accountService = accountService;
        this.oAuthService = oAuthService;
    }
    AccountController.prototype.loginWithGoogle = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.accountService.loginWithGoogle(code)];
                    case 1:
                        token = _a.sent();
                        return [2 /*return*/, {
                                url: "".concat(_environments_1["default"].FRONTEND_URL, "?access_token=").concat(token)
                            }];
                }
            });
        });
    };
    AccountController.prototype.register = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.accountService.register(dto)];
                    case 1:
                        token = _a.sent();
                        return [2 /*return*/, { token: token }];
                }
            });
        });
    };
    AccountController.prototype.login = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.accountService.login(dto.username, dto.password)];
                    case 1:
                        token = _a.sent();
                        return [2 /*return*/, { token: token }];
                }
            });
        });
    };
    AccountController.prototype.forgotPassword = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.accountService.forgotPassword(dto.username)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                message: 'An email was sent to your email address, ' +
                                    'follow the link in that email to reset your password'
                            }];
                }
            });
        });
    };
    AccountController.prototype.resetPassword = function (auth, dto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(auth.type !== 'Verifier')) return [3 /*break*/, 2];
                        if (!dto.oldPassword)
                            throw new common_1.BadRequestException('oldPassword should not be empty');
                        return [4 /*yield*/, this.accountService.login(auth.username, dto.oldPassword)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.accountService.resetPassword(auth.username, dto.password)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, {
                                message: 'Reset password successfuly'
                            }];
                }
            });
        });
    };
    __decorate([
        (0, common_1.Get)('/google'),
        (0, common_1.Redirect)(),
        __param(0, (0, common_1.Query)('code'))
    ], AccountController.prototype, "loginWithGoogle");
    __decorate([
        (0, common_1.Post)('/register'),
        __param(0, (0, common_1.Body)())
    ], AccountController.prototype, "register");
    __decorate([
        (0, common_1.Post)('/login'),
        __param(0, (0, common_1.Body)())
    ], AccountController.prototype, "login");
    __decorate([
        (0, common_1.Post)('/forgot'),
        __param(0, (0, common_1.Body)())
    ], AccountController.prototype, "forgotPassword");
    __decorate([
        (0, common_1.Patch)('/reset'),
        (0, _guards_1.Authorize)(),
        __param(0, (0, _decorators_1.AuthUser)()),
        __param(1, (0, common_1.Body)())
    ], AccountController.prototype, "resetPassword");
    AccountController = __decorate([
        (0, common_1.Controller)('account')
    ], AccountController);
    return AccountController;
}());
exports.AccountController = AccountController;
