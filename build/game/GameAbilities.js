"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AbilityFactory_1 = require("../abilities/AbilityFactory");
var GameAbilities = (function () {
    function GameAbilities() {
    }
    GameAbilities.prototype.handleAbilityList = function (client) {
        if (!client.player) {
            client.respondAbilityList(null, 0, "You do not have a player.");
            return;
        }
        var abilityList = client.player.getAbilityList();
        client.respondAbilityList(abilityList, client.player.abilityPoints, null);
    };
    GameAbilities.prototype.handleAbilityCast = function (client, data) {
        if (!client.player || !client.player.map) {
            client.respondAbilityCast(null, "You are not in a room.");
            return;
        }
        var _a = data.abilityName, abilityName = _a === void 0 ? null : _a, _b = data.objectID, objectID = _b === void 0 ? null : _b;
        if (!abilityName || !objectID) {
            client.respondAbilityCast(null, "Bad request json.");
            return;
        }
        var target = client.player.map.getUnit(objectID);
        if (!target) {
            client.respondAbilityCast(null, "Target does not exist.");
            return;
        }
        client.player.castAbility(abilityName, target, function (err) {
            if (!err) {
                client.respondAbilityCast("Success.", null);
            }
            else {
                client.respondAbilityCast(null, err.message);
            }
        });
    };
    GameAbilities.prototype.handleAbilityUpgrade = function (client, data) {
        if (!client.player) {
            client.respondAbilityUpgrade(null, "You do not have a player.");
            return;
        }
        var _a = data.abilityName, abilityName = _a === void 0 ? null : _a;
        if (!abilityName) {
            client.respondAbilityUpgrade(null, "Bad request json.");
            return;
        }
        if (client.player.hasAbility(abilityName)) {
            if (client.player.upgradeAbility(abilityName)) {
                client.respondAbilityUpgrade(client.player.getAbilityList(), null);
            }
            else {
                client.respondAbilityUpgrade(null, "Unable to upgrade ability.");
            }
        }
        else {
            var ability = AbilityFactory_1.AbilityFactory.create(abilityName, 1);
            if (ability) {
                if (client.player.learnAbility(ability)) {
                    client.respondAbilityUpgrade(client.player.getAbilityList(), null);
                }
                else {
                    client.respondAbilityUpgrade(null, "Unable to learn ability." + abilityName + " " + JSON.stringify(client.player.getAbilities()));
                }
            }
            else {
                client.respondAbilityUpgrade(null, "Invalid ability name.");
            }
        }
    };
    return GameAbilities;
}());
exports.GameAbilities = GameAbilities;
