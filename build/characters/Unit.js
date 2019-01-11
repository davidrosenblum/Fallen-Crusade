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
var CombatCharacter_1 = require("./CombatCharacter");
var Ability_1 = require("../abilities/Ability");
var AbilityFactory_1 = require("../abilities/AbilityFactory");
var Unit = (function (_super) {
    __extends(Unit, _super);
    function Unit(config) {
        var _this = _super.call(this, config) || this;
        _this._abilities = {};
        _this._map = null;
        if (config.abilities)
            _this.learnInitialAbilities(config.abilities);
        return _this;
    }
    Unit.prototype.learnInitialAbilities = function (abilities) {
        for (var abilityName in abilities) {
            var level = abilities[abilityName];
            var ability = AbilityFactory_1.AbilityFactory.create(abilityName, level);
            if (ability) {
                this.learnAbility(ability);
            }
        }
    };
    Unit.prototype.castAbility = function (abilityName, target, handleError) {
        var formattedName = Ability_1.Ability.formatName(abilityName);
        if (this.hasAbility(formattedName)) {
            this._abilities[formattedName].cast(this, target, handleError);
        }
    };
    Unit.prototype.learnAbility = function (ability) {
        var abilityName = Ability_1.Ability.formatName(ability.name);
        if (!this.hasAbility(abilityName)) {
            this._abilities[abilityName] = ability;
            this.emit("ability-learn", { abilityName: ability.name });
            this.emit("ability-upgrade", { abilityName: ability.name, level: ability.level });
            return true;
        }
        return false;
    };
    Unit.prototype.upgradeAbility = function (abilityName) {
        var formattedName = Ability_1.Ability.formatName(abilityName);
        if (this.hasAbility(formattedName)) {
            var ability = this._abilities[formattedName];
            if (ability.upgrade()) {
                this.emit("ability-upgrade", { abilityName: ability.name, level: ability.level });
                return true;
            }
        }
        return false;
    };
    Unit.prototype.hasAbility = function (abilityName) {
        return abilityName in this._abilities;
    };
    Unit.prototype.getAbilities = function () {
        var abilities = {};
        this.forEachAbility(function (ability, abilityName) { return abilities[abilityName] = ability.level; });
        return abilities;
    };
    Unit.prototype.getAbilityList = function () {
        var abilityList = [];
        this.forEachAbility(function (ability) { return abilityList.push(ability.toListItem()); });
        return abilityList;
    };
    Unit.prototype.setMap = function (map) {
        if (!map || map.hasUnit(this) || map.addUnit(this)) {
            this._map = map;
            return true;
        }
        return false;
    };
    Unit.prototype.forEachAbility = function (fn) {
        for (var abilityName in this._abilities) {
            fn(this._abilities[abilityName], abilityName);
        }
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
