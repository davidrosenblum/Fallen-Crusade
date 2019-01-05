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
var events_1 = require("events");
var Ability = (function (_super) {
    __extends(Ability, _super);
    function Ability(config) {
        var _this = _super.call(this) || this;
        _this._name = config.name;
        _this._manaCost = config.manaCost;
        _this._recharge = config.recharge;
        _this._range = config.range;
        _this._maxTargets = config.maxTargets || 1;
        _this._level = 1;
        _this._ready = false;
        for (var i = 1; i < _this._level; i++) {
            _this.upgrade();
        }
        return _this;
    }
    Ability.prototype.cast = function (caster, target, handleError) {
        if (!this.isReady) {
            handleError(new Error("Not done recharging."));
            return;
        }
        if (!caster.hasEnoughMana(this.manaCost)) {
            handleError(new Error("Not enough mana."));
            return;
        }
        if (!this.validateTarget(caster, target)) {
            handleError(new Error("Invalid target."));
            return;
        }
        if (!caster.inRange(target, this.range)) {
            handleError(new Error("Target not in range."));
            return;
        }
        caster.useMana(this.manaCost);
        this.beginCooldown();
        if (caster.team === target.team || !target.rollDodge()) {
            this.effect(caster, target);
            if (this.maxTargets > 1 && caster.map) {
                caster.map.handleAoEAbility(caster, target, this);
            }
        }
    };
    Ability.prototype.beginCooldown = function () {
        var _this = this;
        this._ready = false;
        setTimeout(function () {
            _this._ready = true;
            _this.emit("recharge");
        }, this.recharge);
    };
    Object.defineProperty(Ability.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ability.prototype, "manaCost", {
        get: function () {
            return this._manaCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ability.prototype, "recharge", {
        get: function () {
            return this._recharge;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ability.prototype, "range", {
        get: function () {
            return this._range;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ability.prototype, "maxTargets", {
        get: function () {
            return this._maxTargets;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ability.prototype, "level", {
        get: function () {
            return this._level;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ability.prototype, "isReady", {
        get: function () {
            return this._ready;
        },
        enumerable: true,
        configurable: true
    });
    return Ability;
}(events_1.EventEmitter));
exports.Ability = Ability;