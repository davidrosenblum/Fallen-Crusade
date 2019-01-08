"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Player_1 = require("../characters/Player");
var MapInstanceFactory_1 = require("../maps/MapInstanceFactory");
var GameMaps = (function () {
    function GameMaps(database) {
        this._maps = MapInstanceFactory_1.MapInstanceFactory.createDefaultMaps();
        this._instances = {};
        this._database = database;
    }
    GameMaps.prototype.loadPlayer = function (client) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._database.getCharacter(client.accountID, client.selectedPlayer)
                .then(function (save) { return resolve(new Player_1.Player(save, client.clientID)); })
                .catch(function (err) { return reject(err); });
        });
    };
    GameMaps.prototype.handleEnterMap = function (client, data) {
        if (!client.selectedPlayer) {
            client.respondEnterMap(null, "You must have a selected character.");
            return;
        }
        var _a = data.mapName, mapName = _a === void 0 ? null : _a;
        if (!mapName) {
            client.respondEnterMap(null, "Bad request json.");
            return;
        }
        var map = this._maps[mapName];
        if (!map) {
            client.respondEnterMap(null, "Map not found.");
            return;
        }
        this.loadPlayer(client)
            .then(function (player) {
            client.setPlayer(player);
            map.addClient(client);
            var mapState = map.getMapState();
            client.respondEnterMap(mapState, null);
        })
            .catch(function (err) {
            client.respondEnterMap(null, err.message);
        });
    };
    GameMaps.prototype.handleEnterInstance = function (client, data) {
        if (!client.selectedPlayer) {
            client.respondEnterInstance(null, "You must have a selected character.");
            return;
        }
        var _a = data.instanceID, instanceID = _a === void 0 ? null : _a;
        if (!instanceID) {
            client.respondEnterInstance(null, "Bad request json.");
            return;
        }
        var map = this._instances[instanceID];
        if (!map) {
            client.respondEnterInstance(null, "Instance not found.");
            return;
        }
        this.loadPlayer(client)
            .then(function (player) {
            client.setPlayer(player);
            map.addClient(client);
            var mapState = map.getMapState();
            client.respondEnterInstance(mapState, null);
        })
            .catch(function (err) {
            client.respondEnterInstance(null, err.message);
        });
    };
    GameMaps.prototype.handleObjectUpdate = function (client, data) {
        if (!client.player || !client.player.map) {
            client.send(13, "You are not in a room.", "bad");
            return;
        }
        client.player.map.updateUnit(data);
    };
    GameMaps.prototype.handeObjectStats = function (client, data) {
        if (!client.player || !client.player.map) {
            client.respondObjectStats(null, "You are not in a map.");
            return;
        }
        var _a = data.objectID, objectID = _a === void 0 ? null : _a;
        if (!objectID) {
            client.respondObjectStats(null, "Bad request json.");
            return;
        }
        var unit = client.player.map.getUnit(objectID);
        if (!unit) {
            client.respondObjectStats(null, "Target does not exist.");
            return;
        }
        var stats;
        if (unit.type === "player") {
            stats = unit.getPlayerStats();
        }
        else {
            stats = unit.getCharacterStats();
        }
        client.respondObjectStats(stats, null);
    };
    GameMaps.prototype.handleCreateInstance = function (client, data) {
        var _this = this;
        if (!client.player || !client.player.map) {
            client.send(25, "You are not in a room.", "bad");
            return;
        }
        var _a = data.instanceName, instanceName = _a === void 0 ? null : _a, _b = data.difficulty, difficulty = _b === void 0 ? 1 : _b;
        if (!instanceName) {
            client.send(25, "Bad request json.", "bad");
            return;
        }
        var instance = null;
        try {
            instance = MapInstanceFactory_1.MapInstanceFactory.create(instanceName);
        }
        catch (err) {
            client.send(25, "Invalid instance name \"" + instanceName + "\".", "bad");
            return;
        }
        this._instances[instance.instanceID] = instance;
        instance.on("empty", function () {
            delete _this._instances[instance.instanceID];
            instance = null;
        });
        this.handleEnterInstance(client, { instanceID: instance.instanceID });
    };
    GameMaps.prototype.handleMapPlayers = function (client) {
        if (!client.player || !client.player.map) {
            client.send(26, "You are not in a room.", "bad");
            return;
        }
        var players = client.player.map.getPlayers();
        client.send(26, { players: players }, "ok");
    };
    return GameMaps;
}());
exports.GameMaps = GameMaps;
