"use strict";
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
exports.participantsTable1645427573188 = void 0;
var participantsTable1645427573188 = /** @class */ (function () {
    function participantsTable1645427573188() {
    }
    participantsTable1645427573188.prototype.up = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("\n            CREATE TABLE participants (\n                id SERIAL PRIMARY KEY,\n                nickname VARCHAR(256),\n                role VARCHAR(16),\n                joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n                removed_at TIMESTAMP,\n\n                \"user\" VARCHAR(32) NOT NULL,\n                seen_message_id BIGINT,\n                delivered_message_id BIGINT,\n                conversation_id INT NOT NULL,\n\n                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,\n                FOREIGN KEY (\"user\") REFERENCES users(username) ON DELETE CASCADE\n            )\n        ")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("\n            CREATE TABLE messages (\n                id BIGSERIAL PRIMARY KEY,\n                content VARCHAR(8000) NOT NULL,\n                revoked_at TIMESTAMP,\n                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n\n                parent_id BIGINT,\n                participant_id INT NOT NULL,\n\n                FOREIGN KEY (parent_id) REFERENCES messages(id) ON DELETE CASCADE,\n                FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE\n            )\n        ")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("\n            ALTER TABLE participants ADD CONSTRAINT FK_ParticipantSeenMessage\n            FOREIGN KEY (seen_message_id) REFERENCES messages(id) ON DELETE SET NULL\n        ")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("\n            ALTER TABLE participants ADD CONSTRAINT FK_ParticipantDeliveredMessage\n            FOREIGN KEY (delivered_message_id) REFERENCES messages(id) ON DELETE SET NULL\n        ")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE INDEX message_parent_id_idx ON messages(parent_id)")];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    participantsTable1645427573188.prototype.down = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("DROP INDEX message_parent_id_idx")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE participants DROP CONSTRAINT FK_ParticipantSeenMessage")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE participants DROP CONSTRAINT FK_ParticipantDeliveredMessage")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE messages")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE participants")];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return participantsTable1645427573188;
}());
exports.participantsTable1645427573188 = participantsTable1645427573188;
