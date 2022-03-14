"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ConversationModule = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var conversation_controller_1 = require("./conversation.controller");
var conversation_service_1 = require("./conversation.service");
var _entities_1 = require("@entities");
var message_1 = require("@app/message");
var ConversationModule = /** @class */ (function () {
    function ConversationModule() {
    }
    ConversationModule = __decorate([
        (0, common_1.Module)({
            imports: [typeorm_1.TypeOrmModule.forFeature([_entities_1.Conversation, _entities_1.Message])],
            providers: [conversation_service_1.ConversationService, message_1.MessageService],
            controllers: [conversation_controller_1.ConversationController],
            exports: [conversation_service_1.ConversationService]
        })
    ], ConversationModule);
    return ConversationModule;
}());
exports.ConversationModule = ConversationModule;
