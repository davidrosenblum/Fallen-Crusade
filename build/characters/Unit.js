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
var CombatCharacter_1 = require("./CombatCharacter");
var Unit = (function (_super) {
    __extends(Unit, _super);
    function Unit(config) {
        var _this = _super.call(this, config) || this;
        _this._abilities = {};
        _this._map = null;
        return _this;
    }
    Unit.prototype.castAbility = function (abilityName, target, handleError) {
        if (this.hasAbility(abilityName)) {
            this._abilities[abilityName].cast(this, target, handleError);
        }
    };
    Unit.prototype.learnAbility = function (ability) {
        if (!this.hasAbility(ability.name)) {
            this._abilities[ability.name] = ability;
            return true;
        }
        return false;
    };
    Unit.prototype.upgradeAbility = function (abilityName) {
        if (this.hasAbility(abilityName)) {
            return this._abilities[abilityName].upgrade();
        }
        return false;
    };
    Unit.prototype.hasAbility = function (abilityName) {
        return abilityName in this._abilities;
    };
    Unit.prototype.getAbilities = function () {
        var abilities = {};
        for (var abilityName in this._abilities) {
            abilities[abilityName] = this._abilities[abilityName].level;
        }
        return abilities;
    };
    Unit.prototype.setMap = function (map) {
        if (!map || map.hasUnit(this) || map.addUnit(this)) {
            this._map = map;
            return true;
        }
        return false;
    };
    Object.defineProperty(Unit.prototype, "map", {
        get: function () {
            return this._map;
        },
        enumerable: true,
        configurable: true
    });
    return Unit;
}(CombatCharacter_1.CombatCharacter));
exports.Unit = Unit;
