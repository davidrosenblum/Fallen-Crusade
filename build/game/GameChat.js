"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AbilityFactory_1 = require("../abilities/AbilityFactory");
var GameChat = (function () {
    function GameChat() {
    }
    GameChat.prototype.handleChatMessage = function (client, data) {
        if (!client.player || !client.player.map) {
            client.sendChatMessage(null, null, "You must be in a map.");
            return;
        }
        var _a = data.chat, chat = _a === void 0 ? null : _a;
        if (!chat) {
            client.sendChatMessage(null, null, "Bad request json.");
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
            case "~learn":
                this.adminCommandLearn(client, split);
                break;
            default:
                client.sendChatMessage("Invalid admin command.");
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
                client.sendChatMessage("Invalid add subcommand.");
                break;
        }
    };
    GameChat.prototype.adminCommandLearn = function (client, split) {
        var abilityArg = split[1] || null;
        var levelArg = parseInt(split[2] || "1") || 1;
        var ability = AbilityFactory_1.AbilityFactory.create(abilityArg, levelArg);
        if (ability) {
            if (!client.player.learnAbility(ability)) {
                client.sendChatMessage("You already have that ability.");
            }
        }
        else {
            client.sendChatMessage("Invalid ability name.");
        }
    };
    return GameChat;
}());
exports.GameChat = GameChat;
