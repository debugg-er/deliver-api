"use strict";
exports.__esModule = true;
var letters = 'abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVXYZ1234567890';
function randomstring(length) {
    var result = '';
    for (var i = 0; i < length; i++) {
        result += letters[~~(Math.random() * letters.length)];
    }
    return result;
}
exports["default"] = randomstring;
