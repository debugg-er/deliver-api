"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.EventModule = void 0;
var common_1 = require("@nestjs/common");
var event_gateway_1 = require("./event.gateway");
var typeorm_1 = require("@nestjs/typeorm");
var _entities_1 = require("@entities");
var EventModule = /** @class */ (function () {
    function EventModule() {
    }
    EventModule = __decorate([
        (0, common_1.Module)({
            imports: [typeorm_1.TypeOrmModule.forFeature([_entities_1.Conversation, _entities_1.User, _entities_1.Participant, _entities_1.Message])],
            providers: [event_gateway_1.EventGateway]
        })
    ], EventModule);
    return EventModule;
}());
exports.EventModule = EventModule;
