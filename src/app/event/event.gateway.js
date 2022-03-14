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
exports.EventGateway = void 0;
var websockets_1 = require("@nestjs/websockets");
var jwt = require("jsonwebtoken");
var typeorm_1 = require("@nestjs/typeorm");
var _environments_1 = require("@environments");
var _entities_1 = require("@entities");
var EventGateway = /** @class */ (function () {
    function EventGateway(userRepository, conversationRepository, participantRepository, messageRepository) {
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.messageRepository = messageRepository;
    }
    EventGateway.prototype.handleConnection = function (client) {
        return __awaiter(this, void 0, void 0, function () {
            var token, decoded, user, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = client.handshake.auth.token;
                        if (!token) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        decoded = jwt.verify(token, _environments_1["default"].JWT_SECRET);
                        return [4 /*yield*/, this.userRepository.findOne(decoded.username)];
                    case 2:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.userRepository.update(user.username, { isActive: true })];
                    case 3:
                        _a.sent();
                        client.handshake.auth.user = user;
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.log(e_1);
                        return [3 /*break*/, 5];
                    case 5:
                        client.leave(client.id);
                        return [2 /*return*/];
                }
            });
        });
    };
    EventGateway.prototype.handleUserJoinConversation = function (client, conversationId) {
        return __awaiter(this, void 0, void 0, function () {
            var participant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!client.handshake.auth.user)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.participantRepository
                                .createQueryBuilder('participant')
                                .innerJoinAndSelect('participant.conversation', 'conversation')
                                .where('conversation.id = :conversationId', { conversationId: conversationId })
                                .andWhere('participant.user = :username', {
                                username: client.handshake.auth.user.username
                            })
                                .getOne()];
                    case 1:
                        participant = _a.sent();
                        if (!participant)
                            return [2 /*return*/];
                        participant.user = client.handshake.auth.user;
                        client.rooms.forEach(function (room) { return client.leave(room); });
                        client.handshake.auth.participant = participant;
                        client.join(participant.conversation.id.toString());
                        console.log(client.rooms);
                        return [2 /*return*/];
                }
            });
        });
    };
    EventGateway.prototype.handleUserSendMessage = function (client, text) {
        return __awaiter(this, void 0, void 0, function () {
            var participant, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        participant = client.handshake.auth.participant;
                        return [4 /*yield*/, this.messageRepository.save(this.messageRepository.create({
                                content: text,
                                participantId: participant.id,
                                participant: participant
                            }))];
                    case 1:
                        message = _a.sent();
                        console.log(message);
                        console.log(participant.conversation.id.toString());
                        this.server.to(participant.conversation.id.toString()).emit('broadcast', message);
                        return [2 /*return*/];
                }
            });
        });
    };
    EventGateway.prototype.handleDisconnect = function (client) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!client.handshake.auth.user)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.userRepository.update(client.handshake.auth.user.username, { isActive: true })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        (0, websockets_1.WebSocketServer)()
    ], EventGateway.prototype, "server");
    __decorate([
        (0, websockets_1.SubscribeMessage)('join')
    ], EventGateway.prototype, "handleUserJoinConversation");
    __decorate([
        (0, websockets_1.SubscribeMessage)('message')
    ], EventGateway.prototype, "handleUserSendMessage");
    EventGateway = __decorate([
        (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } }),
        __param(0, (0, typeorm_1.InjectRepository)(_entities_1.User)),
        __param(1, (0, typeorm_1.InjectRepository)(_entities_1.Conversation)),
        __param(2, (0, typeorm_1.InjectRepository)(_entities_1.Participant)),
        __param(3, (0, typeorm_1.InjectRepository)(_entities_1.Message))
    ], EventGateway);
    return EventGateway;
}());
exports.EventGateway = EventGateway;
