"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PendingInviteFactory_1 = require("./invites/PendingInviteFactory");
var GameInvites = (function () {
    function GameInvites() {
        this._pendingInvites = {};
    }
    GameInvites.prototype.handleInviteSend = function (client, data, findClient) {
        if (!client.map) {
            client.respondInviteSend(null, "You are not in a map.");
            return;
        }
        var _a = data.objectID, objectID = _a === void 0 ? null : _a, _b = data.inviteType, inviteType = _b === void 0 ? null : _b;
        if (!objectID || !inviteType) {
            client.respondInviteSend(null, "Bad request json.");
            return;
        }
        var targetClient = findClient(objectID);
        if (!targetClient) {
            client.respondInviteSend(null, "Couldn't find target to invite.");
            return;
        }
        if (targetClient.hasPendingInvite) {
            client.respondInviteSend(null, targetClient.selectedPlayer + " is busy.");
            return;
        }
        var invite = PendingInviteFactory_1.PendingInviteFactory.create("instance", targetClient, client);
        targetClient.setPendingInvite(invite);
        targetClient.notifyInvite(invite.message);
        client.respondInviteSend("Invite sent to " + targetClient.selectedPlayer + ".", null);
    };
    GameInvites.prototype.handleReplyInvite = function (client, data) {
        if (!client.map) {
            client.respondInviteReply(null, "You are not in a map.");
            return;
        }
        if (!client.pendingInvite) {
            client.respondInviteReply(null, "You do not have any pending invitations.");
            return;
        }
        var accept = data.accept;
        if (typeof accept !== "boolean") {
            client.respondInviteReply(null, "Bad request json.");
            return;
        }
        if (!client.pendingInvite.isPending) {
            client.respondInviteReply(null, "Invitation expired.");
            return;
        }
        client.pendingInvite.from.sendChatMessage(client.selectedPlayer + " has " + (accept ? "accepted" : "declined") + " your invite.");
        client.pendingInvite.resolve(accept);
        client.setPendingInvite(null);
    };
    return GameInvites;
}());
exports.GameInvites = GameInvites;
