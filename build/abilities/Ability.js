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
        _this._recharge = config.rechargeSec / 1000;
        _this._range = config.range;
        _this._radius = config.radius || _this._range;
        _this._maxTargets = config.maxTargets || 1;
        _this._level = config.level;
        _this._ready = true;
        for (var i = 1; i < _this._level; i++) {
            _this.upgrade();
        }
        return _this;
    }
    Ability.prototype.cast = function (caster, target, handleError) {
        var _this = this;
        if (this.level < 1) {
            handleError(new Error("Ability not learned."));
            return;
        }
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
        this.beginCooldown(function () { return caster.emit("ability-ready", { abilityName: _this.name }); });
        if (caster.team === target.team || !target.rollDodge()) {
            this.effect(caster, target);
            if (this.maxTargets > 1 && caster.map) {
                caster.map.handleAoEAbility(caster, target, this);
            }
        }
    };
    Ability.prototype.beginCooldown = function (ready) {
        var _this = this;
        this._ready = false;
        setTimeout(function () {
            _this._ready = true;
            _this.emit("ready");
            ready();
        }, this.recharge);
    };
    Ability.prototype.upgrade = function () {
        if (this.level < Ability.UPGRADE_CAP) {
            this._level++;
            return true;
        }
        return false;
    };
    Ability.prototype.validateEnemiesOnly = function (caster, target) {
        return caster.team !== target.team;
    };
    Ability.prototype.validateAlliesOnly = function (caster, target) {
        return target === caster || this.validateAlliesOrSelf(caster, target);
    };
    Ability.prototype.validateAlliesOrSelf = function (caster, target) {
        return caster.team === target.team;
    };
    Ability.prototype.validateNotSelf = function (caster, target) {
        return caster !== target;
    };
    Ability.prototype.setManaCost = function (manaCost) {
        this._manaCost = manaCost;
    };
    Ability.prototype.setMaxTargets = function (maxTargets) {
        this._maxTargets = maxTargets;
    };
    Ability.prototype.setRecharge = function (rechargeSec) {
        this._recharge = rechargeSec;
    };
    Ability.prototype.setRange = function (range) {
        this._range = range;
    };
    Ability.prototype.toListItem = function () {
        return {
            abilityName: this.formattedName,
            name: this.name,
            level: this.level
        };
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
    Object.defineProperty(Ability.prototype, "radius", {
        get: function () {
            return this._radius;
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
    Object.defineProperty(Ability.prototype, "upgradeLevels", {
        get: function () {
            return Math.max(0, this._level - 1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ability.prototype, "formattedName", {
        get: function () {
            return Ability.formatName(this.name);
        },
        enumerable: true,
        configurable: true
    });
    Ability.formatName = function (abilityName) {
        return abilityName.toLowerCase().replace(/[\s_]/gi, "-");
    };
    Ability.UPGRADE_CAP = 3;
    Ability.RANGE_CLOSE = 64;
    Ability.RANGE_MEDIUM = 128;
    Ability.RANGE_FAR = 256;
    Ability.RADIUS_SMALL = 32;
    Ability.RADIUS_MEDIUM = 64;
    Ability.RADIUS_LARGE = 128;
    return Ability;
}(events_1.EventEmitter));
exports.Ability = Ability;
