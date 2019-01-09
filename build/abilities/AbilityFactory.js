"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ability_1 = require("./Ability");
var Abilities_1 = require("./Abilities");
var AbilityFactory = (function () {
    function AbilityFactory() {
    }
    AbilityFactory.create = function (abilityName, level) {
        switch (Ability_1.Ability.formatName(abilityName)) {
            case "incinerate":
                return new Abilities_1.Incinerate(level);
            case "fireball":
                return new Abilities_1.Fireball(level);
            case "lightning-storm":
                return new Abilities_1.LightningStorm(level);
            case "healing-touch":
                return new Abilities_1.HealingTouch(level);
            case "arcane-barrier":
                return new Abilities_1.ArcaneBarrier(level);
            default:
                return null;
        }
    };
    return AbilityFactory;
}());
exports.AbilityFactory = AbilityFactory;
