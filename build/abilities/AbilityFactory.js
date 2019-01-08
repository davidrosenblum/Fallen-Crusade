"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Abilities_1 = require("./Abilities");
var AbilityFactory = (function () {
    function AbilityFactory() {
    }
    AbilityFactory.create = function (abilityName, level) {
        if (level === void 0) { level = 1; }
        switch (abilityName) {
            case "fireball":
                return new Abilities_1.Fireball(level);
            default:
                return null;
        }
    };
    return AbilityFactory;
}());
exports.AbilityFactory = AbilityFactory;
