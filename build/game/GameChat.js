"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameChat = (function () {
    function GameChat() {
    }
    GameChat.prototype.handleChatMessage = function (client, data) {
        if (!client.player || !client.player.map) {
            client.respondChatMessage(null, null, "You must be in a map.");
            return;
        }
        var _a = data.chat, chat = _a === void 0 ? null : _a;
        if (!chat) {
            client.respondChatMessage(null, null, "Bad request json.");
            return;
        }
        if (chat.charAt(0) === "~" && client.accessLevel > 1) {
            this.handleAdminCommand(client, chat);
        }
        else {
            client.player.map.broadcastChat(chat, client.selectedPlayer);
        }
    };
    GameChat.prototype.handleAdminCommand = function (client, chat) {
        var split = chat.split(" ");
        var command = split[0];
        switch (command) {
            case "~broadcast":
                client.player.map.broadcastChat(split[1], "<Server Admin>");
                break;
            case "~add":
                this.adminCommandAdd(client, split);
                break;
            default:
                this.sendChat(client, "Invalid admin command.");
                break;
        }
    };
    GameChat.prototype.adminCommandAdd = function (client, split) {
        var subcommand = split[1] || null;
        var arg = parseInt(split[2]) || 1;
        switch (subcommand) {
            case "xp":
                client.player.addXP(arg);
                break;
            case "gold":
                client.player.addGold(arg);
                break;
            default:
                this.sendChat(client, "Invalid add subcommand.");
                break;
        }
    };
    GameChat.prototype.sendChat = function (client, chat, from) {
        client.respondChatMessage(chat, from, null);
    };
    return GameChat;
}());
exports.GameChat = GameChat;
