"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Unit_1 = require("./Unit");
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(saveData, ownerID, spawnLocation) {
        var _this = _super.call(this, {
            name: saveData.name,
            type: "player",
            team: "Crusaders",
            ownerID: ownerID,
            health: 25,
            healthRegen: 0.02,
            mana: 100,
            manaRegen: 0.02,
            defense: 0,
            resistance: 0,
            abilities: saveData.abilities || {},
            spawnLocation: spawnLocation
        }) || this;
        _this._level = Math.max(1, Math.min(saveData.level, Player.LEVEL_CAP));
        _this._xpNeeded = _this.calculateXPNeeded();
        _this._xp = Math.max(0, Math.min(saveData.xp, _this._xpNeeded - 1));
        _this._gold = Math.max(0, Math.min(saveData.gold, Player.GOLD_CAP));
        _this._abilityPoints = Math.max(0, Math.min(saveData.ability_points, Player.LEVEL_CAP - 1));
        _this._skin = Math.max(1, saveData.skin);
        return _this;
    }
    Player.prototype.calculateXPNeeded = function () {
        return (this.level + 1) * (this.level + 2);
    };
    Player.prototype.levelUp = function () {
        if (this._level < Player.LEVEL_CAP) {
            this._xpNeeded = this.calculateXPNeeded();
            this._xp = 0;
            this._level++;
            this.emit("level", { level: this.level });
            this.addAbilityPoints(1);
        }
    };
    Player.prototype.addXP = function (xp) {
        var xpRemaining = xp;
        while (xpRemaining >= this.xpToGo) {
            this.levelUp();
        }
        this._xp += xpRemaining;
        this.emit("xp", { xp: xp });
    };
    Player.prototype.addGold = function (gold) {
        this._gold = Math.min(this.gold + gold, Player.GOLD_CAP);
        this.emit("gold", { gold: gold });
    };
    Player.prototype.addAbilityPoints = function (points) {
        this._abilityPoints = Math.min(this.abilityPoints + points, Player.LEVEL_CAP - 1);
        this.emit("ability-points", { abilityPoints: points });
    };
    Player.prototype.setSkin = function (skin) {
        this._skin = Math.max(1, skin);
        this.emit("skin-change", { skin: skin });
    };
    Player.prototype.upgradeAbility = function (abilityName) {
        if (this._abilityPoints > 0) {
            if (_super.prototype.upgradeAbility.call(this, abilityName)) {
                this._abilityPoints--;
                this.emit("ability-points", { abilityPoints: -1 });
                return true;
            }
        }
        return false;
    };
    Player.prototype.getPlayerStats = function () {
        var stats = this.getCharacterStats();
        return {
            base: stats.base,
            current: stats.current,
            objectID: stats.objectID,
            name: stats.name,
            team: stats.team,
            gold: this.gold,
            xp: this.xp,
            xpNeeded: this.xpNeeded,
            abilityPoints: this.abilityPoints,
            level: this.level,
            abilities: this.getAbilities()
        };
    };
    Player.prototype.getDatabaseUpdate = function (field) {
        var $set = {
            level: this.level,
            xp: this.xp,
            gold: this.gold,
            ability_points: this.abilityPoints,
            skin: this.skin,
            abilities: this.getAbilities()
        };
        if (this.map) {
            $set.last_map = this.map.name;
        }
        if (field && field in $set) {
            var update = {};
            update[field] = $set[field];
            return { $set: update };
        }
        return { $set: $set };
    };
    Object.defineProperty(Player.prototype, "xpToGo", {
        get: function () {
            return this._xpNeeded - this._xp;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "xp", {
        get: function () {
            return this._xp;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "xpNeeded", {
        get: function () {
            return this._xpNeeded;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "level", {
        get: function () {
            return this._level;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "gold", {
        get: function () {
            return this._gold;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "abilityPoints", {
        get: function () {
            return this._abilityPoints;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "skin", {
        get: function () {
            return this._skin;
        },
        enumerable: true,
        configurable: true
    });
    Player.LEVEL_CAP = 50;
    Player.GOLD_CAP = 999999;
    return Player;
}(Unit_1.Unit));
exports.Player = Player;
