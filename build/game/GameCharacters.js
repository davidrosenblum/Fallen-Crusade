"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameCharacters = (function () {
    function GameCharacters(database) {
        this._database = database;
    }
    GameCharacters.prototype.handleCharacterList = function (client) {
        if (!client.hasAccountData) {
            client.respondCharacterList(null, "You are not logged in.");
            return;
        }
        this._database.getCharacterList(client.accountID)
            .then(function (characterList) {
            client.respondCharacterList(characterList, null);
        })
            .catch(function (err) {
            client.respondCharacterList(null, "You are not logged in.");
        });
    };
    GameCharacters.prototype.handleCharacterCreate = function (client, data) {
        if (!client.hasAccountData) {
            client.respondCharacterCreate(null, "You are not logged in.");
            return;
        }
        var _a = data.name, name = _a === void 0 ? null : _a, _b = data.skin, skin = _b === void 0 ? 1 : _b;
        if (!name) {
            client.respondCharacterCreate(null, "Bad request json.");
            return;
        }
        this._database.createCharacter(client.accountID, name, skin)
            .then(function (response) {
            client.respondCharacterCreate(response, null);
        })
            .catch(function (err) {
            console.log('err in HCC', err.message);
            client.respondCharacterCreate(null, err.message);
        });
    };
    GameCharacters.prototype.handleCharacterDelete = function (client, data) {
        if (!client.hasAccountData) {
            client.respondCharacterDelete(null, "You are not logged in.");
            return;
        }
        var _a = data.name, name = _a === void 0 ? null : _a;
        if (!name) {
            client.respondCharacterDelete(null, "Bad request json.");
            return;
        }
        this._database.deleteCharacter(client.accountID, name)
            .then(function (response) {
            client.respondCharacterDelete(response, null);
        })
            .catch(function (err) {
            client.respondCharacterDelete(null, err.message);
        });
    };
    GameCharacters.prototype.handleCharacterSelect = function (client, data, success) {
        if (!client.hasAccountData) {
            client.respondCharacterSelect(null, "You are not logged in.");
            return;
        }
        if (client.player) {
            client.respondCharacterSelect(null, "You already have a player.");
            return;
        }
        var _a = data.name, name = _a === void 0 ? null : _a;
        if (!name) {
            client.respondCharacterSelect(null, "Bad request json.");
            return;
        }
        this._database.getCharacter(client.accountID, name)
            .then(function (save) {
            client.setSelectedPlayer(name);
            client.respondCharacterSelect("Success.", null);
            success(save);
        })
            .catch(function (err) {
            client.respondCharacterSelect(null, "Server error.");
        });
    };
    return GameCharacters;
}());
exports.GameCharacters = GameCharacters;
