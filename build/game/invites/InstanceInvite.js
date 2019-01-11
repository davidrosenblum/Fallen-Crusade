"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PendingInvite_1 = require("./PendingInvite");
var InstanceInvite = (function (_super) {
    __extends(InstanceInvite, _super);
    function InstanceInvite(to, from, declineTimeout) {
        var _this = this;
        var pname = from.selectedPlayer;
        var lvl = from.player.level;
        var mname = from.player.map.name;
        var ppl = from.player.map.numClients;
        var message = pname + " (Level " + lvl + ") has invited you to join them in the " + mname + ", with " + ppl + " other players.";
        _this = _super.call(this, "instance", message, to, from, declineTimeout) || this;
        _this._map = from.player.map;
        return _this;
    }
    InstanceInvite.prototype.onAccept = function () {
        if (this._map) {
            this._map.addClient(this.to);
        }
    };
    return InstanceInvite;
}(PendingInvite_1.PendingInvite));
exports.InstanceInvite = InstanceInvite;
