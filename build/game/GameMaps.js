"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameClient_1 = require("./GameClient");
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
                .then(function (save) {
                var player = new Player_1.Player(save, client.clientID);
                _this.setPlayerListeners(client, player);
                resolve({ player: player, lastMap: save.last_map });
            })
                .catch(function (err) { return reject(err); });
        });
    };
    GameMaps.prototype.setPlayerListeners = function (client, player) {
        var _this = this;
        var accountID = client.accountID;
        var name = player.name;
        player.on("level", function (evt) {
            client.sendChatMessage("You have reached level " + evt.level + ".");
            client.respondObjectStats(player.getPlayerStats(), null);
            _this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("level"))
                .catch(function (err) { return console.log("Level update error: " + err.message); });
        });
        player.on("xp", function (evt) {
            client.sendChatMessage("You gained " + evt.xp + " XP.");
            client.respondObjectStats(player.getPlayerStats(), null);
            _this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("xp"))
                .catch(function (err) { return console.log("XP update error: " + err.message); });
        });
        player.on("gold", function (evt) {
            client.sendChatMessage("You earned " + evt.gold + " gold.");
            client.respondObjectStats(player.getPlayerStats(), null);
            _this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("gold"))
                .catch(function (err) { return console.log("Gold update error: " + err.message); });
        });
        player.on("ability-points", function (evt) {
            var points = evt.abilityPoints;
            var message = points > 1 ? "You gained " + points + " ability points" : "You gained an ability point.";
            client.sendChatMessage(message);
            client.respondObjectStats(player.getPlayerStats(), null);
            _this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("ability_points"))
                .catch(function (err) { return console.log("Ability update error: " + err.message); });
        });
        player.on("ability-learn", function (evt) {
            client.sendChatMessage("You have acquired the ability \"" + evt.abilityName + "\".");
            _this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("abilities"))
                .catch(function (err) { return console.log("Ability update error: " + err.message); });
        });
        player.on("ability-upgrade", function (evt) {
            client.sendChatMessage(evt.abilityName + " upgraded to level " + evt.level + ".");
            _this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("abilities"))
                .catch(function (err) { return console.log("Ability update error: " + err.message); });
        });
        player.on("skin-change", function (evt) {
            var data = { skin: evt.skin, objectID: player.objectID };
            player.map.bulkUpdate(GameClient_1.GameClient.createResponse(20, data));
            _this._database.updateCharacter(accountID, name, player.getDatabaseUpdate("skin"))
                .catch(function (err) { return console.log("Skin update error: " + err.message); });
        });
        player.on("ability-ready", function (evt) { return client.notifyAbilityReady(evt.abilityName); });
    };
    GameMaps.prototype.handleEnterMap = function (client, data, done) {
        var _this = this;
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
            .then(function (result) {
            client.setPlayer(result.player);
            map.addClient(client);
            if (result.lastMap !== map.name) {
                _this._database.updateCharacter(client.accountID, client.player.name, client.player.getDatabaseUpdate("last_map"));
            }
            var mapState = map.getMapState();
            client.respondEnterMap(mapState, null);
        })
            .catch(function (err) {
            client.respondEnterMap(null, err.message);
        })
            .then(function () {
            if (done)
                done();
        });
    };
    GameMaps.prototype.handleEnterInstance = function (client, data, done) {
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
            .then(function (result) {
            client.setPlayer(result.player);
            map.addClient(client);
            var mapState = map.getMapState();
            client.respondEnterInstance(mapState, null);
        })
            .catch(function (err) {
            client.respondEnterInstance(null, err.message);
        })
            .then(function () {
            if (done)
                done();
        });
    };
    GameMaps.prototype.handleObjectUpdate = function (client, data) {
        if (!client.player || !client.player.map) {
            return;
        }
        client.player.map.updateUnit(data);
    };
    GameMaps.prototype.handeObjectStats = function (client, data) {
        if (!client.map) {
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
    GameMaps.prototype.handleCreateInstance = function (client, data, callback) {
        var _this = this;
        if (!client.map) {
            client.respondCreateInstance(null, "You are not in a map.");
            return;
        }
        var _a = data.instanceName, instanceName = _a === void 0 ? null : _a, _b = data.difficulty, difficulty = _b === void 0 ? 1 : _b, _c = data.objectIDs, objectIDs = _c === void 0 ? null : _c;
        if (!instanceName) {
            client.respondCreateInstance(null, "Bad request json.");
            return;
        }
        var instance = null;
        try {
            instance = MapInstanceFactory_1.MapInstanceFactory.create(instanceName);
        }
        catch (err) {
            client.respondCreateInstance(null, "Invalid instance name \"" + instanceName + "\".");
            return;
        }
        this._instances[instance.instanceID] = instance;
        instance.on("empty", function () {
            delete _this._instances[instance.instanceID];
            instance = null;
        });
        client.respondCreateInstance("Success.", null);
        this.handleEnterInstance(client, { instanceID: instance.instanceID }, function () {
            if (objectIDs && objectIDs.length) {
                objectIDs.forEach(function (objectID) { return callback(objectID); });
                client.sendChatMessage(objectIDs.length + " invites to join were just sent.");
            }
        });
    };
    GameMaps.prototype.handleMapPlayers = function (client) {
        if (!client.map) {
            client.respondMapPlayers(null, "You are not in a map.");
            return;
        }
        var players = client.player.map.getPlayers();
        client.respondMapPlayers(players, null);
    };
    GameMaps.prototype.handleAvailablePlayers = function (client) {
        if (!client.player) {
            client.respondAvailablePlayers(null, "You do not have a player.");
            return;
        }
        var players = [];
        this.forEachMap(function (map) { return players = players.concat(map.getPlayers()); });
        players = players.filter(function (player) { return player.name !== client.player.name; });
        client.respondAvailablePlayers(players, null);
    };
    GameMaps.prototype.findClientByPlayerID = function (objectID) {
        var unit = null;
        for (var mapName in this._maps) {
            unit = this._maps[mapName].getUnit(objectID);
            if (unit) {
                return unit.map.getClient(unit.ownerID);
            }
        }
    };
    GameMaps.prototype.getMapStats = function () {
        var stats = {
            maps: {}, instances: {}
        };
        this.forEachMap(function (map) { return stats.maps[map.name] = map.getMapStats(); });
        this.forEachInstance(function (instance) { return stats.instances[instance.instanceID] = instance.getMapStats(); });
        return stats;
    };
    GameMaps.prototype.forEachMap = function (fn) {
        for (var mapName in this._maps) {
            fn(this._maps[mapName]);
        }
    };
    GameMaps.prototype.forEachInstance = function (fn) {
        for (var instanceID in this._instances) {
            fn(this._instances[instanceID]);
        }
    };
    return GameMaps;
}());
exports.GameMaps = GameMaps;
