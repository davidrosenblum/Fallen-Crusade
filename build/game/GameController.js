"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameClient_1 = require("./GameClient");
var GameAccounts_1 = require("./GameAccounts");
var GameCharacters_1 = require("./GameCharacters");
var GameMaps_1 = require("./GameMaps");
var GameChat_1 = require("./GameChat");
var GameAbilities_1 = require("./GameAbilities");
var GameInvites_1 = require("./GameInvites");
var GameController = (function () {
    function GameController(database, settings) {
        this._clients = {};
        this._database = database;
        this._accounts = new GameAccounts_1.GameAccounts(this._database);
        this._characters = new GameCharacters_1.GameCharacters(this._database);
        this._maps = new GameMaps_1.GameMaps(this._database);
        this._chat = new GameChat_1.GameChat();
        this._abilities = new GameAbilities_1.GameAbilities();
        this._invites = new GameInvites_1.GameInvites();
    }
    GameController.prototype.handleConnection = function (conn) {
        var _this = this;
        var client = new GameClient_1.GameClient(conn);
        this._clients[client.clientID] = client;
        conn.on("message", function (data) {
            GameClient_1.GameClient.parseResponse(data, function (opCode, data) {
                _this.handleClientRequest(client, opCode, data);
            });
        });
        conn.on("error", function () {
        });
        conn.on("close", function () {
            delete _this._clients[client.clientID];
            _this._accounts.forceLogout(client);
            client = null;
        });
    };
    GameController.prototype.handleClientRequest = function (client, opCode, data) {
        var _this = this;
        switch (opCode) {
            case 2:
                this._accounts.handleLogin(client, data);
                break;
            case 3:
                this._accounts.handleLogout(client);
                break;
            case 4:
                this._characters.handleCharacterList(client);
                break;
            case 5:
                this._characters.handleCharacterCreate(client, data);
                break;
            case 7:
                this._characters.handleCharacterDelete(client, data);
                break;
            case 6:
                this._characters.handleCharacterSelect(client, data, function (save) {
                    _this._maps.handleEnterMap(client, { mapName: save.last_map });
                });
                break;
            case 8:
                this._maps.handleEnterMap(client, data);
                break;
            case 9:
                this._maps.handleEnterInstance(client, data);
                break;
            case 13:
                this._maps.handleObjectUpdate(client, data);
                break;
            case 14:
                this._maps.handeObjectStats(client, data);
                break;
            case 10:
                this._chat.handleChatMessage(client, data);
                break;
            case 16:
                this._abilities.handleAbilityList(client);
                break;
            case 17:
                this._abilities.handleAbilityUpgrade(client, data);
                break;
            case 18:
                this._abilities.handleAbilityCast(client, data);
                break;
            case 21:
                this._invites.handleInviteSend(client, data);
                break;
            case 23:
                this._invites.handleReplyInvite(client, data);
                break;
            case 25:
                this._maps.handleCreateInstance(client, data);
                break;
            case 26:
                this._maps.handleMapPlayers(client);
                break;
            case 27:
                this._maps.handleAvailablePlayers(client);
                break;
            default:
                client.send(99, "Bad request opcode.", "bad");
                break;
        }
    };
    GameController.prototype.getMapStats = function () {
        return this._maps.getMapStats();
    };
    Object.defineProperty(GameController.prototype, "invites", {
        get: function () {
            return this._invites;
        },
        enumerable: true,
        configurable: true
    });
    return GameController;
}());
exports.GameController = GameController;
