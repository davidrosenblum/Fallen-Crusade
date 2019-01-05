"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InstanceInvite_1 = require("./InstanceInvite");
var PendingInviteFactory = (function () {
    function PendingInviteFactory() {
    }
    PendingInviteFactory.create = function (type, to, from, declineTimeout) {
        switch (type) {
            case "instance":
                return new InstanceInvite_1.InstanceInvite(to, from, declineTimeout);
            default:
                return null;
        }
    };
    return PendingInviteFactory;
}());
exports.PendingInviteFactory = PendingInviteFactory;
