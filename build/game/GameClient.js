"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Comm_1 = require("./Comm");
var TokenGenerator_1 = require("../utils/TokenGenerator");
var GameClient = (function () {
    function GameClient(conn) {
        this._clientID = GameClient.tokenGen.nextToken();
        this._conn = conn;
        this._accountData = null;
        this._selectedPlayer = null;
        this._player = null;
        this._pendingInvite = null;
    }
    GameClient.parseResponse = function (data, onRequest) {
        data.utf8Data.split(Comm_1.MSG_DELIM).forEach(function (msg) {
            var opCode, data;
            try {
                var json = JSON.parse(msg);
                opCode = json.opCode || 99;
                data = json.data || {};
            }
            catch (err) {
                return;
            }
            onRequest(opCode, data);
        });
    };
    GameClient.createResponse = function (opCode, data, status) {
        if (data === void 0) { data = null; }
        if (status === void 0) { status = "ok"; }
        return {
            opCode: opCode,
            data: (typeof data === "string") ? { message: data } : data,
            status: status
        };
    };
    GameClient.prototype.setPendingInvite = function (invite) {
        this._pendingInvite = invite;
    };
    GameClient.prototype.setAccountData = function (accountData) {
        this._accountData = accountData;
    };
    GameClient.prototype.setSelectedPlayer = function (name) {
        this._selectedPlayer = name;
    };
    GameClient.prototype.setPlayer = function (player) {
        if (player && this.player !== player) {
            if (this.player) {
                this.player.map.removeClient(this);
                this._player = null;
            }
        }
        this._player = player;
    };
    GameClient.prototype.send = function (opCode, data, status) {
        if (data === void 0) { data = null; }
        if (status === void 0) { status = "ok"; }
        var message = GameClient.createResponse(opCode, data, status);
        this._conn.send(JSON.stringify(message) + Comm_1.MSG_DELIM);
    };
    GameClient.prototype.sendString = function (str) {
        this._conn.send(str + Comm_1.MSG_DELIM);
    };
    GameClient.prototype.respondLogin = function (clientID, errMsg) {
        this.send(2, errMsg || { clientID: clientID }, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondLogout = function (message, errMsg) {
        this.send(3, errMsg || message, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondCharacterList = function (characterList, errMsg) {
        this.send(4, characterList ? { characterList: characterList } : errMsg, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondCharacterCreate = function (message, errMsg) {
        this.send(5, errMsg || message, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondCharacterDelete = function (message, errMsg) {
        this.send(7, errMsg || message, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondCharacterSelect = function (message, errMsg) {
        this.send(6, errMsg || message, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondEnterMap = function (mapState, errMsg) {
        this.send(8, errMsg || { mapState: mapState }, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondEnterInstance = function (mapState, errMsg) {
        this.send(9, errMsg || { mapState: mapState }, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondChatMessage = function (chat, from, errMsg) {
        this.send(10, errMsg || { chat: chat, from: from }, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondObjectStats = function (stats, errMsg) {
        this.send(14, errMsg || { stats: stats }, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondAbilityList = function (abilityList, errMsg) {
        this.send(18, errMsg || { abilityList: abilityList }, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondAbilityUpgrade = function (abilityList, errMsg) {
        this.send(17, errMsg || { abilityList: abilityList }, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondAbilityCast = function (message, errMsg) {
        this.send(18, errMsg || message, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondInviteSend = function (message, errMsg) {
        this.send(21, errMsg || message, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.respondInviteReply = function (message, errMsg) {
        this.send(23, errMsg || message, errMsg ? "bad" : "ok");
    };
    GameClient.prototype.notifyObjectCreate = function (spawnState) {
        this.send(11, { spawnState: spawnState }, "ok");
    };
    GameClient.prototype.notifyObjectDelete = function (objectID) {
        this.send(12, { objectID: objectID }, "ok");
    };
    GameClient.prototype.notifyObjectUpdate = function (updateState) {
        this.send(13, { updateState: updateState }, "ok");
    };
    GameClient.prototype.notifyInvite = function (message) {
        this.send(22, { message: message }, "ok");
    };
    GameClient.prototype.notifyInviteResponse = function (accepted) {
        this.send(24, { accepted: accepted }, "ok");
    };
    Object.defineProperty(GameClient.prototype, "accountID", {
        get: function () {
            return this.hasAccountData ? this._accountData.accountID : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameClient.prototype, "username", {
        get: function () {
            return this.hasAccountData ? this._accountData.username : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameClient.prototype, "accessLevel", {
        get: function () {
            return this.hasAccountData ? this._accountData.accessLevel : -1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameClient.prototype, "hasAccountData", {
        get: function () {
            return this._accountData !== null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameClient.prototype, "hasPendingInvite", {
        get: function () {
            return this._pendingInvite !== null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameClient.prototype, "clientID", {
        get: function () {
            return this._clientID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameClient.prototype, "selectedPlayer", {
        get: function () {
            return this._selectedPlayer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameClient.prototype, "player", {
        get: function () {
            return this._player;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameClient.prototype, "pendingInvite", {
        get: function () {
            return this._pendingInvite;
        },
        enumerable: true,
        configurable: true
    });
    GameClient.tokenGen = new TokenGenerator_1.TokenGenerator(16);
    return GameClient;
}());
exports.GameClient = GameClient;
