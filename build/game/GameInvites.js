"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PendingInviteFactory_1 = require("./invites/PendingInviteFactory");
var GameInvites = (function () {
    function GameInvites() {
        this._pendingInvites = {};
    }
    GameInvites.prototype.handleInviteSend = function (client, data) {
        if (!client.player || !client.player.map) {
            client.respondInviteSend(null, "You are not in a map.");
            return;
        }
        var _a = data.objectID, objectID = _a === void 0 ? null : _a, _b = data.inviteType, inviteType = _b === void 0 ? null : _b;
        if (!objectID || !inviteType) {
            client.respondInviteSend(null, "Bad request json.");
            return;
        }
        var unit = client.player.map.getUnit(objectID);
        if (!unit) {
            client.respondInviteSend(null, "Target not found.");
            return;
        }
        var targetClient = unit.map.getClient(unit.ownerID);
        if (!targetClient) {
            client.respondInviteSend(null, "Target is not a player.");
            return;
        }
        if (targetClient.hasPendingInvite) {
            client.respondInviteSend(null, targetClient.selectedPlayer + " is busy.");
            return;
        }
        var invite = PendingInviteFactory_1.PendingInviteFactory.create(inviteType, client, targetClient);
        targetClient.setPendingInvite(invite);
        targetClient.notifyInvite(invite.message);
        client.respondInviteSend("Invite sent to " + targetClient.selectedPlayer + ".", null);
    };
    GameInvites.prototype.handleReplyInvite = function (client, data) {
        if (!client.player || !client.player.map) {
            client.respondInviteReply(null, "You are not in a map.");
            return;
        }
        if (!client.pendingInvite) {
            client.respondInviteReply(null, "You do not have any pending invitations.");
            return;
        }
        var _a = data.inviteID, inviteID = _a === void 0 ? null : _a, _b = data.accept, accept = _b === void 0 ? null : _b;
        if (!inviteID || typeof accept !== "boolean") {
            client.respondInviteReply(null, "Bad request json.");
            return;
        }
        var invite = this.getPendingInvite(inviteID);
        if (!invite || invite !== client.pendingInvite) {
            client.respondInviteReply(null, "Invalid invite ID.");
            return;
        }
        if (!invite.isPending) {
            client.respondInviteReply(null, "Invitation expired.");
            return;
        }
        invite.resolve(accept);
        delete this._pendingInvites[invite.inviteID];
        client.setPendingInvite(null);
        delete this._pendingInvites[invite.inviteID];
        invite = null;
    };
    GameInvites.prototype.getPendingInvite = function (inviteID) {
        return this._pendingInvites[inviteID] || null;
    };
    return GameInvites;
}());
exports.GameInvites = GameInvites;
