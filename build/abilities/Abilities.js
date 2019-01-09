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
var Ability_1 = require("./Ability");
var Incinerate = (function (_super) {
    __extends(Incinerate, _super);
    function Incinerate(level) {
        return _super.call(this, {
            name: "Incinerate",
            manaCost: 5,
            rechargeSec: 6,
            range: Incinerate.RANGE_MEDIUM,
            maxTargets: 1,
            radius: 0,
            level: level
        }) || this;
    }
    Incinerate.prototype.effect = function (caster, target) {
        var upgrades = this.upgradeLevels;
        var damage = Incinerate.BASE_DAMAGE + (upgrades * 1);
        var tickDamage = Incinerate.BASE_TICK_DAMAGE + (upgrades * 0.5);
        target.takeDamageWithDOT(damage, tickDamage, Incinerate.BASE_NUM_TICKS);
    };
    Incinerate.prototype.validateTarget = function (caster, target) {
        return this.validateEnemiesOnly(caster, target);
    };
    Incinerate.prototype.upgrade = function () {
        if (_super.prototype.upgrade.call(this)) {
            this.setManaCost(this.manaCost - 0.5);
            this.setRecharge(this.recharge - 0.25);
            return true;
        }
        return false;
    };
    Incinerate.BASE_DAMAGE = 15;
    Incinerate.BASE_TICK_DAMAGE = 2;
    Incinerate.BASE_NUM_TICKS = 2;
    return Incinerate;
}(Ability_1.Ability));
exports.Incinerate = Incinerate;
var Fireball = (function (_super) {
    __extends(Fireball, _super);
    function Fireball(level) {
        return _super.call(this, {
            name: "Fireball",
            manaCost: 10,
            rechargeSec: 12,
            range: Fireball.RANGE_MEDIUM,
            radius: Fireball.RADIUS_MEDIUM,
            maxTargets: 6,
            level: level
        }) || this;
    }
    Fireball.prototype.effect = function (caster, target) {
        var upgrades = this.upgradeLevels;
        var damage = Fireball.BASE_DAMAGE + (upgrades * 2);
        var tickDamage = Fireball.BASE_TICK_DAMAGE + (upgrades);
        target.takeDamageWithDOT(damage, tickDamage, Fireball.BASE_NUM_TICKS);
    };
    Fireball.prototype.validateTarget = function (caster, target) {
        return this.validateEnemiesOnly(caster, target);
    };
    Fireball.prototype.upgrade = function () {
        if (_super.prototype.upgrade.call(this)) {
            this.setMaxTargets(this.maxTargets + 1);
            this.setManaCost(this.manaCost - 1);
            this.setRecharge(this.recharge - 0.5);
            return true;
        }
        return false;
    };
    Fireball.BASE_DAMAGE = 20;
    Fireball.BASE_TICK_DAMAGE = 5;
    Fireball.BASE_NUM_TICKS = 2;
    return Fireball;
}(Ability_1.Ability));
exports.Fireball = Fireball;
var LightningStorm = (function (_super) {
    __extends(LightningStorm, _super);
    function LightningStorm(level) {
        return _super.call(this, {
            name: "Lightning Storm",
            manaCost: 25,
            rechargeSec: 45,
            range: LightningStorm.RANGE_CLOSE,
            radius: LightningStorm.RADIUS_LARGE,
            maxTargets: 12,
            level: level
        }) || this;
    }
    LightningStorm.prototype.effect = function (caster, target) {
        var upgrades = this.upgradeLevels;
        var damage = LightningStorm.BASE_DAMAGE + (upgrades * 10);
        if (target.takeDamage(damage)) {
            target.drainMana(LightningStorm.BASE_MANA_DRAIN + ((upgrades * 2) / 100));
        }
    };
    LightningStorm.prototype.validateTarget = function (caster, target) {
        return this.validateEnemiesOnly(caster, target);
    };
    LightningStorm.prototype.upgrade = function () {
        if (_super.prototype.upgrade.call(this)) {
            this.setManaCost(this.manaCost - 2);
            this.setRecharge(this.recharge - 2.5);
            return true;
        }
        return false;
    };
    LightningStorm.BASE_DAMAGE = 60;
    LightningStorm.BASE_MANA_DRAIN = 0.05;
    return LightningStorm;
}(Ability_1.Ability));
exports.LightningStorm = LightningStorm;
var HealingTouch = (function (_super) {
    __extends(HealingTouch, _super);
    function HealingTouch(level) {
        return _super.call(this, {
            name: "Healing Touch",
            manaCost: 10,
            rechargeSec: 20,
            range: HealingTouch.RANGE_CLOSE,
            radius: 0,
            maxTargets: 1,
            level: level
        }) || this;
    }
    HealingTouch.prototype.effect = function (caster, target) {
        var upgrades = this.upgradeLevels;
        var healthPercent = HealingTouch.BASE_HEALTH + (upgrades / 10);
        target.heal(healthPercent);
    };
    HealingTouch.prototype.validateTarget = function (caster, target) {
        return this.validateAlliesOnly(caster, target);
    };
    HealingTouch.prototype.upgrade = function () {
        if (_super.prototype.upgrade.call(this)) {
            this.setManaCost(this.manaCost - 2);
            this.setRecharge(this.recharge - 2.5);
            return true;
        }
        return false;
    };
    HealingTouch.BASE_HEALTH = 0.20;
    return HealingTouch;
}(Ability_1.Ability));
exports.HealingTouch = HealingTouch;
var ArcaneBarrier = (function (_super) {
    __extends(ArcaneBarrier, _super);
    function ArcaneBarrier(level) {
        return _super.call(this, {
            name: "Arcane Barrier",
            manaCost: 40,
            rechargeSec: 30,
            range: ArcaneBarrier.RANGE_CLOSE,
            radius: ArcaneBarrier.RADIUS_LARGE,
            maxTargets: 99,
            level: level
        }) || this;
    }
    ArcaneBarrier.prototype.effect = function (caster, target) {
        var upgrades = this.upgradeLevels;
        var resistance = ArcaneBarrier.BASE_RESISTANCE + (upgrades * 0.05);
        var duration = ArcaneBarrier.BASE_DURATION + (upgrades * 5000);
    };
    ArcaneBarrier.prototype.validateTarget = function (caster, target) {
        return this.validateAlliesOrSelf(caster, target);
    };
    ArcaneBarrier.BASE_RESISTANCE = 0.25;
    ArcaneBarrier.BASE_DURATION = 1000 * 20;
    return ArcaneBarrier;
}(Ability_1.Ability));
exports.ArcaneBarrier = ArcaneBarrier;
