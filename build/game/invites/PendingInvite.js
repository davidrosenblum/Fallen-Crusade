"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TokenGenerator_1 = require("../../utils/TokenGenerator");
var PendingInvite = (function () {
    function PendingInvite(type, message, to, from, declineTimeout) {
        if (declineTimeout === void 0) { declineTimeout = 15000; }
        var _this = this;
        this._inviteID = PendingInvite.tokenGen.nextToken();
        this._type = type;
        this._message = message;
        this._to = to;
        this._from = from;
        this._pending = true;
        if (declineTimeout > 0) {
            setTimeout(function () {
                if (_this) {
                    _this.resolve(false);
                }
            }, declineTimeout);
        }
    }
    PendingInvite.prototype.resolve = function (accept) {
        if (this.isPending) {
            this._pending = false;
            if (accept) {
                this.onAccept();
            }
        }
    };
    Object.defineProperty(PendingInvite.prototype, "inviteID", {
        get: function () {
            return this._inviteID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PendingInvite.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PendingInvite.prototype, "message", {
        get: function () {
            return this._message;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PendingInvite.prototype, "to", {
        get: function () {
            return this._to;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PendingInvite.prototype, "from", {
        get: function () {
            return this._from;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PendingInvite.prototype, "isPending", {
        get: function () {
            return this._pending;
        },
        enumerable: true,
        configurable: true
    });
    PendingInvite.tokenGen = new TokenGenerator_1.TokenGenerator(16);
    return PendingInvite;
}());
exports.PendingInvite = PendingInvite;
