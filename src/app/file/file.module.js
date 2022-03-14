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
exports.__esModule = true;
exports.FileModule = void 0;
var fs = require("fs");
var crypto = require("crypto");
var multer = require("multer");
var mimeType = require("mime-types");
var common_1 = require("@nestjs/common");
var platform_express_1 = require("@nestjs/platform-express");
var _environments_1 = require("@environments");
var file_controller_1 = require("./file.controller");
var file_service_1 = require("./file.service");
var typeorm_1 = require("@nestjs/typeorm");
var _entities_1 = require("@entities");
var FileModule = /** @class */ (function () {
    function FileModule(messageRepository, participantRepository, userRepository, cr) {
        this.messageRepository = messageRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.cr = cr;
        if (!fs.existsSync(_environments_1["default"].TEMP_FOLDER_PATH)) {
            fs.mkdirSync(_environments_1["default"].TEMP_FOLDER_PATH);
        }
    }
    FileModule = __decorate([
        (0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forFeature([_entities_1.Message, _entities_1.Participant, _entities_1.User, _entities_1.Conversation]),
                platform_express_1.MulterModule.register({
                    limits: { fileSize: 20 * 1024 * 1024 },
                    storage: multer.diskStorage({
                        destination: _environments_1["default"].TEMP_FOLDER_PATH,
                        filename: function (req, file, cb) {
                            var rand = crypto.randomBytes(16).toString('hex');
                            var extension = mimeType.extension(file.mimetype);
                            cb(null, rand + '.' + extension);
                        }
                    })
                }),
            ],
            controllers: [file_controller_1.FileController],
            providers: [file_service_1.FileService]
        }),
        __param(0, (0, typeorm_1.InjectRepository)(_entities_1.Message)),
        __param(1, (0, typeorm_1.InjectRepository)(_entities_1.Participant)),
        __param(2, (0, typeorm_1.InjectRepository)(_entities_1.User)),
        __param(3, (0, typeorm_1.InjectRepository)(_entities_1.Conversation))
    ], FileModule);
    return FileModule;
}());
exports.FileModule = FileModule;
