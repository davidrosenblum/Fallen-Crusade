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
var Fireball = (function (_super) {
    __extends(Fireball, _super);
    function Fireball(level) {
        return _super.call(this, {
            name: "Fireball",
            manaCost: 5,
            rechargeSec: 4,
            range: 128,
            maxTargets: 6,
            level: level
        }) || this;
    }
    Fireball.prototype.effect = function (caster, target) {
        var damage = Fireball.BASE_DAMAGE + ((this.level - 1) * 2);
        var tickDamage = Fireball.BASE_TICK_DAMAGE + (this.level - 1);
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
    Fireball.BASE_DAMAGE = 25;
    Fireball.BASE_TICK_DAMAGE = 5;
    Fireball.BASE_NUM_TICKS = 2;
    return Fireball;
}(Ability_1.Ability));
exports.Fireball = Fireball;
