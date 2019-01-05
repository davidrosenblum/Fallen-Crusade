"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameAbilities = (function () {
    function GameAbilities() {
    }
    GameAbilities.prototype.handleAbilityList = function (client) {
        if (!client.player) {
            client.respondAbilityList(null, "You do not have a player.");
            return;
        }
        var abilityList = client.player.getAbilities();
        client.respondAbilityList(abilityList, null);
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
            client.send(17, "Bad request json.", "bad");
            return;
        }
        if (client.player.hasAbility(abilityName)) {
            if (client.player.upgradeAbility(abilityName)) {
                client.send(17, "Ability upgraded.", "ok");
            }
            else {
                client.send(17, "Unable to upgade ability.", "bad");
            }
        }
        else {
            if (client.player.upgradeAbility(abilityName)) {
                client.send(17, "Ability learned.", "ok");
            }
            else {
                client.send(17, "Unable to learn ability.", "bad");
            }
        }
    };
    return GameAbilities;
}());
exports.GameAbilities = GameAbilities;
