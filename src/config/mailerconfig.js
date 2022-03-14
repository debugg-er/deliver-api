"use strict";
exports.__esModule = true;
var _environments_1 = require("@environments");
exports["default"] = {
    transport: {
        service: 'gmail',
        port: 465,
        secure: true,
        auth: {
            user: _environments_1["default"].MAIL,
            pass: _environments_1["default"].MAIL_PASSWORD
        }
    }
};
