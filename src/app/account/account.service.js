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
exports.AccountService = void 0;
var argon2 = require("argon2");
var typeorm_1 = require("@nestjs/typeorm");
var common_1 = require("@nestjs/common");
var _entities_1 = require("@entities");
var _environments_1 = require("@environments");
var randomstring_1 = require("@utils/randomstring");
var AccountService = /** @class */ (function () {
    function AccountService(mailerService, jwtService, userService, oAuthService, userRepository) {
        this.mailerService = mailerService;
        this.jwtService = jwtService;
        this.userService = userService;
        this.oAuthService = oAuthService;
        this.userRepository = userRepository;
    }
    AccountService.prototype.loginWithGoogle = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var googleProfile, user, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.oAuthService.oAuthGoogle(code)];
                    case 1:
                        googleProfile = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, this.userService.findUserByUsername(googleProfile.sub)];
                    case 3:
                        user = _b.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        _a = _b.sent();
                        return [4 /*yield*/, this.userService.createUser({
                                username: googleProfile.sub,
                                password: (0, randomstring_1["default"])(16),
                                email: googleProfile.email,
                                firstName: googleProfile.family_name,
                                lastName: googleProfile.given_name,
                                female: true
                            })];
                    case 5:
                        user = _b.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, this.createJWT(user)];
                }
            });
        });
    };
    AccountService.prototype.register = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userService.createUser(dto)];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, this.createJWT(user)];
                }
            });
        });
    };
    AccountService.prototype.login = function (username, password) {
        return __awaiter(this, void 0, void 0, function () {
            var user, isMatch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository
                            .createQueryBuilder('users')
                            .select(['users.username', 'users.password'])
                            .where({ username: username })
                            .getOne()];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new common_1.NotFoundException("Username doesn't exist");
                        }
                        return [4 /*yield*/, argon2.verify(user.password, password)];
                    case 2:
                        isMatch = _a.sent();
                        if (!isMatch) {
                            throw new common_1.BadRequestException("password doesn't match");
                        }
                        return [2 /*return*/, this.createJWT(user)];
                }
            });
        });
    };
    AccountService.prototype.forgotPassword = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userService.findUserByUsername(username)];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, this.sendForgotPasswordMail(user)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AccountService.prototype.resetPassword = function (username, newPassword) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.userService.updateUser(username, { password: newPassword });
                return [2 /*return*/];
            });
        });
    };
    AccountService.prototype.sendForgotPasswordMail = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = this.jwtService.sign({
                            type: 'Verifier',
                            username: user.username,
                            email: user.email
                        });
                        return [4 /*yield*/, this.mailerService.sendMail({
                                from: _environments_1["default"].MAIL,
                                to: user.email,
                                subject: '[Deliver] Reset your account password',
                                text: "click here to reset your password: ".concat(_environments_1["default"].FRONTEND_URL, "/reset?token=").concat(token)
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AccountService.prototype.createJWT = function (user) {
        return this.jwtService.sign({
            type: 'Bearer',
            username: user.username
        });
    };
    AccountService = __decorate([
        (0, common_1.Injectable)(),
        __param(4, (0, typeorm_1.InjectRepository)(_entities_1.User))
    ], AccountService);
    return AccountService;
}());
exports.AccountService = AccountService;
