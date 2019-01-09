"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameAccounts = (function () {
    function GameAccounts(database) {
        this._accounts = {};
        this._database = database;
    }
    GameAccounts.prototype.handleLogin = function (client, data) {
        var _this = this;
        var _a = data.username, username = _a === void 0 ? null : _a, _b = data.password, password = _b === void 0 ? null : _b, _c = data.version, version = _c === void 0 ? null : _c;
        if (version !== GameAccounts.CLIENT_VERSION) {
            client.respondLogin(null, -1, "Wrong client version.");
            return;
        }
        if (username in this._accounts) {
            client.respondLogin(null, -1, "Account \"" + username + "\" is already online.");
            return;
        }
        this._database.getAccount(username, password)
            .then(function (accountData) {
            _this._accounts[username] = client;
            client.setAccountData(accountData);
            client.respondLogin(client.clientID, client.accessLevel, null);
        })
            .catch(function (err) {
            client.respondLogin(null, -1, err.message);
        });
    };
    GameAccounts.prototype.handleLogout = function (client) {
        this.forceLogout(client);
        client.respondLogout("You have been logged out.", null);
    };
    GameAccounts.prototype.forceLogout = function (client) {
        if (client.hasAccountData) {
            delete this._accounts[client.username];
        }
        if (client.player && client.player.map) {
            client.player.map.removeClient(client);
        }
        client.setPlayer(null);
        client.setSelectedPlayer(null);
        if (client.hasPendingInvite) {
            client.pendingInvite.from.notifyInviteResponse(false);
        }
    };
    GameAccounts.CLIENT_VERSION = "0.1.0";
    return GameAccounts;
}());
exports.GameAccounts = GameAccounts;
