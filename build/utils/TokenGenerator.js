"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TokenGenerator = (function () {
    function TokenGenerator(tokenLength) {
        if (tokenLength === void 0) { tokenLength = 16; }
        this._tokenLength = tokenLength;
        this._tokens = {};
    }
    TokenGenerator.prototype.nextToken = function () {
        var token = null;
        do {
            token = TokenGenerator.anyToken(this.tokenLength);
        } while (this.hasToken(token));
        this._tokens[token] = true;
        return token;
    };
    TokenGenerator.prototype.releaseToken = function (token) {
        return delete this._tokens[token];
    };
    TokenGenerator.prototype.hasToken = function (token) {
        return token in this._tokens;
    };
    Object.defineProperty(TokenGenerator.prototype, "tokenLength", {
        get: function () {
            return this._tokenLength;
        },
        enumerable: true,
        configurable: true
    });
    TokenGenerator.hashToken = function (input) {
        var buffer = new Array(input.length);
        var halfWayIndex = Math.ceil(input.length / 2) - 1;
        for (var i = 0, s = 0; i < input.length; i++) {
            var cc = input.charCodeAt(i);
            var hashIndex = (i + Math.pow(cc, 2)) % TokenGenerator.vals.length;
            var hashChar = TokenGenerator.vals[hashIndex];
            if (i < halfWayIndex) {
                s = halfWayIndex - i;
            }
            else if (i >= halfWayIndex) {
                s = input.length - i + halfWayIndex;
            }
            buffer[s] = hashChar;
        }
        return buffer.join("");
    };
    TokenGenerator.anyToken = function (tokenLength) {
        var buffer = new Array(tokenLength);
        for (var i = 0; i < tokenLength; i++) {
            var arrayIndex = Math.floor(Math.random() * TokenGenerator.vals.length);
            buffer[i] = TokenGenerator.vals[arrayIndex];
        }
        return buffer.join("");
    };
    TokenGenerator.vals = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    return TokenGenerator;
}());
exports.TokenGenerator = TokenGenerator;
