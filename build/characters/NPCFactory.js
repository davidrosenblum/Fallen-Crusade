"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NPC_1 = require("./NPC");
var NPCFactory = (function () {
    function NPCFactory() {
    }
    NPCFactory.create = function (options) {
        var type = options.type, ownerID = options.ownerID, x = options.x, y = options.y, _a = options.anim, anim = _a === void 0 ? null : _a, _b = options.name, name = _b === void 0 ? null : _b, _c = options.team, team = _c === void 0 ? null : _c, _d = options.tier, tier = _d === void 0 ? null : _d;
        if (type in this.npcTypes) {
            var doc = this.npcTypes[type];
            return new NPC_1.NPC({
                ownerID: ownerID,
                type: doc.type,
                name: name || doc.name,
                team: team || doc.team,
                tier: tier || doc.tier,
                moveSpeed: doc.move_speed,
                anim: anim || null,
                health: doc.health,
                healthRegen: doc.health_regen,
                mana: doc.mana,
                manaRegen: doc.mana_regen,
                defense: doc.defense,
                resistance: doc.resistance,
                xpValue: doc.xp_value,
                goldValue: doc.gold_value,
                x: x,
                y: y
            });
        }
        else
            throw new Error("Invalid NPC type.");
    };
    NPCFactory.setNPCTypes = function (docs) {
        var _this = this;
        docs.forEach(function (doc) {
            _this.npcTypes[doc.type] = doc;
        });
    };
    NPCFactory.npcTypes = {};
    return NPCFactory;
}());
exports.NPCFactory = NPCFactory;
