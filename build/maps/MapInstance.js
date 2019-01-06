"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TokenGenerator_1 = require("../utils/TokenGenerator");
var TransportNode_1 = require("./TransportNode");
var NPCFactory_1 = require("../characters/NPCFactory");
var events_1 = require("events");
var MapInstance = (function (_super) {
    __extends(MapInstance, _super);
    function MapInstance(name, mapData) {
        var _this = _super.call(this) || this;
        _this._instanceID = MapInstance.tokenGen.nextToken();
        _this._name = name;
        _this._mapData = mapData;
        _this._units = {};
        _this._transportNodes = {};
        _this._clients = {};
        _this._numClients = 0;
        return _this;
    }
    MapInstance.prototype.broadcastChat = function (chat, from) {
        this.forEachClient(function (client) {
            client.respondChatMessage(chat, from);
        });
    };
    MapInstance.prototype.addClient = function (client) {
        if (!this.hasClient(client)) {
            this._clients[client.clientID] = client;
            this.broadcastChat(client.selectedPlayer + " connected.");
            this.addUnit(client.player);
            return true;
        }
        return false;
    };
    MapInstance.prototype.removeClient = function (client) {
        if (this.hasClient(client)) {
            delete this._clients[client.clientID];
            this.removeUnit(client.player);
            this.broadcastChat(client.selectedPlayer + " disconneced.");
            if (this.isEmpty)
                this.emit("empty");
            return true;
        }
        return false;
    };
    MapInstance.prototype.addUnit = function (unit) {
        if (!this.hasUnit(unit)) {
            this._units[unit.objectID] = unit;
            unit.setMap(this);
            var data_1 = unit.getSpawnState();
            this.forEachClient(function (client) { return client.notifyObjectCreate(data_1); });
            return true;
        }
        return false;
    };
    MapInstance.prototype.removeUnit = function (unit) {
        if (this.hasUnit(unit)) {
            delete this._units[unit.objectID];
            unit.setMap(null);
            this.forEachClient(function (client) { return client.notifyObjectDelete(unit.objectID); });
            return true;
        }
        return false;
    };
    MapInstance.prototype.updateUnit = function (data) {
        var unit = data.objectID ? this.getUnit(data.objectID) : null;
        if (unit) {
            unit.setState(data);
            this.forEachClient(function (client) { return client.notifyObjectUpdate(data); });
        }
    };
    MapInstance.prototype.createNPC = function (options) {
        var type = options.type, row = options.row, col = options.col, name = options.name, team = options.team, anim = options.anim, tier = options.tier;
        var npcOpts = {
            ownerID: "server",
            spawnLocation: { col: col, row: row },
            tier: tier,
            type: type,
            name: name,
            team: team,
            anim: anim
        };
        var npc = NPCFactory_1.NPCFactory.create(npcOpts);
        if (npc) {
            this.addUnit(npc);
        }
    };
    MapInstance.prototype.createTransportNode = function (options) {
        var type = options.type, text = options.text, col = options.col, row = options.row, outMapName = options.outMapName, outCol = options.outCol, outRow = options.outRow;
        var tnode = new TransportNode_1.TransportNode(type, text, col, row, outMapName, outCol, outRow);
        this._transportNodes[tnode.nodeID] = tnode;
    };
    MapInstance.prototype.handleAoEAbility = function (caster, target, ability) {
        var targetsToGo = ability.maxTargets - 1;
        for (var id in this._units) {
            var unit = this._units[id];
            if (ability.validateTarget(caster, unit) && unit !== target) {
                ability.effect(caster, target);
                if (--targetsToGo === 0)
                    break;
            }
        }
    };
    MapInstance.prototype.giveBounty = function (xp, gold, filter) {
        if (xp === void 0) { xp = 0; }
        if (gold === void 0) { gold = 0; }
        this.forEachClient(function (client) {
            if (!filter || filter(client.player)) {
                client.player.addXP(xp);
                client.player.addGold(gold);
            }
        });
    };
    MapInstance.prototype.hasClient = function (client) {
        return client.clientID in this._clients;
    };
    MapInstance.prototype.hasUnit = function (unit) {
        return unit.objectID in this._units;
    };
    MapInstance.prototype.getClient = function (clientID) {
        return this._clients[clientID] || null;
    };
    MapInstance.prototype.getUnit = function (objectID) {
        return this._units[objectID] || null;
    };
    MapInstance.prototype.forEachUnit = function (fn) {
        for (var id in this._units) {
            fn(this._units[id], id);
        }
    };
    MapInstance.prototype.forEachTransportNode = function (fn) {
        for (var id in this._transportNodes) {
            fn(this._transportNodes[id], id);
        }
    };
    MapInstance.prototype.forEachClient = function (fn) {
        for (var id in this._clients) {
            fn(this._clients[id], id);
        }
    };
    MapInstance.prototype.getRelativeMapState = function (client) {
        var units = [];
        this.forEachUnit(function (unit) {
            units.push(unit.getSpawnState());
        });
        var transportNodes = [];
        this.forEachTransportNode(function (tnode) {
            transportNodes.push(tnode.getTransportNodeState());
        });
        return {
            mapState: {
                name: this.name,
                mapData: this._mapData,
                transportNodes: transportNodes,
                units: units
            },
            playerState: client.player.getPlayerState()
        };
    };
    Object.defineProperty(MapInstance.prototype, "isEmpty", {
        get: function () {
            return this._numClients === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MapInstance.prototype, "instanceID", {
        get: function () {
            return this._instanceID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MapInstance.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MapInstance.prototype, "numClients", {
        get: function () {
            return this._numClients;
        },
        enumerable: true,
        configurable: true
    });
    MapInstance.tokenGen = new TokenGenerator_1.TokenGenerator(16);
    return MapInstance;
}(events_1.EventEmitter));
exports.MapInstance = MapInstance;
