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
var Character_1 = require("./Character");
var CombatCharacter = (function (_super) {
    __extends(CombatCharacter, _super);
    function CombatCharacter(config) {
        var _this = _super.call(this, config) || this;
        _this._baseStats = _this.combatStatsFromConfig(config);
        _this._currStats = _this.combatStatsFromConfig(config);
        return _this;
    }
    CombatCharacter.prototype.combatStatsFromConfig = function (config) {
        var _a = config.health, health = _a === void 0 ? 1 : _a, _b = config.healthRegen, healthRegen = _b === void 0 ? 0 : _b, _c = config.mana, mana = _c === void 0 ? 1 : _c, _d = config.manaRegen, manaRegen = _d === void 0 ? 0 : _d, _e = config.defense, defense = _e === void 0 ? 0 : _e, _f = config.resistance, resistance = _f === void 0 ? 0 : _f;
        return {
            health: Math.max(1, Math.min(health, CombatCharacter.HEALTH_CAP)),
            healthRegen: Math.max(0, Math.min(healthRegen, CombatCharacter.HEALTH_REGEN_CAP)),
            mana: Math.max(1, Math.min(mana, CombatCharacter.MANA_CAP)),
            manaRegen: Math.max(0, Math.min(manaRegen, CombatCharacter.MANA_REGEN_CAP)),
            defense: Math.max(0, Math.min(defense, CombatCharacter.DEFENSE_CAP)),
            resistance: Math.max(0, Math.min(resistance, CombatCharacter.RESISTANCE_CAP))
        };
    };
    CombatCharacter.prototype.useMana = function (mana) {
        if (this.hasEnoughMana(mana)) {
            this._currStats.mana -= mana;
            this.emit("mana", { mana: -mana });
            return true;
        }
        return false;
    };
    CombatCharacter.prototype.hasEnoughMana = function (manaNeeded) {
        return this._currStats.mana >= manaNeeded;
    };
    CombatCharacter.prototype.takeDamage = function (damage, defend, resist) {
        if (defend === void 0) { defend = true; }
        if (resist === void 0) { resist = true; }
        if (defend && this.rollDodge()) {
            this.emit("dodge");
            return false;
        }
        var resistAmount = resist ? (damage * this._currStats.resistance) : 0;
        var actualDamage = damage - resistAmount;
        this._currStats.health -= actualDamage;
        this.emit("health", { health: -actualDamage });
        if (this._currStats.health <= 0) {
            this.emit("death");
        }
        return true;
    };
    CombatCharacter.prototype.takeDamageWithDOT = function (damage, tickDamage, ticks, defend, resist) {
        if (defend === void 0) { defend = true; }
        if (resist === void 0) { resist = true; }
        if (this.takeDamage(damage, defend, resist)) {
            this.takeDamageOverTime(tickDamage, ticks, defend, resist);
        }
    };
    CombatCharacter.prototype.takeDamageOverTime = function (damagePerTick, ticks, defend, resist) {
        var _this = this;
        if (defend === void 0) { defend = true; }
        if (resist === void 0) { resist = true; }
        setTimeout(function () { return _this.takeDamage(damagePerTick, defend, resist); }, 1000);
    };
    CombatCharacter.prototype.rollDodge = function () {
        return Math.random() + this._currStats.defense >= CombatCharacter.DODGE_ROLL_NEEDED;
    };
    CombatCharacter.prototype.getCharacterStats = function () {
        return {
            base: this.getBaseStats(),
            current: this.getCurrentStats(),
            objectID: this.objectID,
            name: this.name,
            team: this.team
        };
    };
    CombatCharacter.prototype.getBaseStats = function () {
        return Object.assign({}, this._baseStats);
    };
    CombatCharacter.prototype.getCurrentStats = function () {
        return Object.assign({}, this._currStats);
    };
    CombatCharacter.HEALTH_CAP = 9999;
    CombatCharacter.HEALTH_REGEN_CAP = 0.15;
    CombatCharacter.MANA_CAP = 9999;
    CombatCharacter.MANA_REGEN_CAP = 0.15;
    CombatCharacter.DEFENSE_CAP = 0.45;
    CombatCharacter.RESISTANCE_CAP = 0.90;
    CombatCharacter.DODGE_ROLL_NEEDED = 0.80;
    CombatCharacter.CRIT_ROLL_NEEDED = 0.90;
    return CombatCharacter;
}(Character_1.Character));
exports.CombatCharacter = CombatCharacter;
