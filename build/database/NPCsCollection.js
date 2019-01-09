"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NPCsCollection = (function () {
    function NPCsCollection() {
    }
    NPCsCollection.createCollections = function (database) {
        database.createCollection("npcs").then(function (er) {
            database.collection("npcs").createIndex("type", { unique: true });
        });
    };
    NPCsCollection.loadNPCs = function (database) {
        return new Promise(function (resolve, reject) {
            database.collection("npcs").find().toArray()
                .then(function (npcs) { return resolve(npcs); })
                .catch(function (err) { return reject(err); });
        });
    };
    NPCsCollection.insertNPC = function (database, doc) {
        return new Promise(function (resolve, reject) {
            database.collection("npcs").insertOne(doc)
                .then(function () { return resolve("NPC inserted."); })
                .catch(function (err) { return reject(err); });
        });
    };
    NPCsCollection.insertDefaults = function (database) {
        return Promise.all([
            this.insertNPC(database, {
                type: "blacksmith",
                name: "Blacksmith",
                team: "Crusaders",
                tier: "contact",
                move_speed: 0,
                health: 500,
                health_regen: 0.10,
                mana: 100,
                mana_regen: 0.10,
                defense: 1,
                resistance: 1,
                abilities: {},
                gold_value: 0,
                xp_value: 0
            }),
            this.insertNPC(database, {
                type: "paragon",
                name: "Paragon",
                team: "Crusaders",
                tier: "contact",
                move_speed: 0,
                health: 500,
                health_regen: 0.10,
                mana: 100,
                mana_regen: 0.10,
                defense: 1,
                resistance: 1,
                abilities: {},
                gold_value: 0,
                xp_value: 0
            }),
            this.insertNPC(database, {
                type: "templar",
                name: "Templar",
                team: "Crusaders",
                tier: "standard",
                move_speed: 1,
                health: 100,
                health_regen: 0.03,
                mana: 100,
                mana_regen: 0.05,
                defense: 0.10,
                resistance: 0.25,
                abilities: {},
                gold_value: 5,
                xp_value: 5
            }),
            this.insertNPC(database, {
                type: "disciple",
                name: "Disciple",
                team: "Crusaders",
                tier: "elite",
                move_speed: 1,
                health: 250,
                health_regen: 0.04,
                mana: 100,
                mana_regen: 0.06,
                defense: 0.20,
                resistance: 0.35,
                abilities: {},
                gold_value: 25,
                xp_value: 25
            }),
            this.insertNPC(database, {
                type: "grave-knight",
                name: "Grave Knight",
                team: "Undead",
                tier: "standard",
                move_speed: 1,
                health: 60,
                health_regen: 0.02,
                mana: 100,
                mana_regen: 0.02,
                defense: 0.00,
                resistance: 0.20,
                abilities: {},
                gold_value: 2,
                xp_value: 5
            }),
            this.insertNPC(database, {
                type: "animus",
                name: "Animus",
                team: "Undead",
                tier: "standard",
                move_speed: 1,
                health: 45,
                health_regen: 0.02,
                mana: 100,
                mana_regen: 0.02,
                defense: 0.15,
                resistance: 0.00,
                abilities: {},
                gold_value: 2,
                xp_value: 5
            }),
            this.insertNPC(database, {
                type: "lich",
                name: "Lich",
                team: "Undead",
                tier: "elite",
                move_speed: 1,
                health: 125,
                health_regen: 0.02,
                mana: 100,
                mana_regen: 0.04,
                defense: 0.20,
                resistance: 0.25,
                abilities: {},
                gold_value: 15,
                xp_value: 20
            }),
            this.insertNPC(database, {
                type: "devourer",
                name: "Devourer",
                team: "Undead",
                tier: "elite",
                move_speed: 1,
                health: 150,
                health_regen: 0.03,
                mana: 100,
                mana_regen: 0.04,
                defense: 0.25,
                resistance: 0.50,
                abilities: {},
                gold_value: 15,
                xp_value: 20
            }),
            this.insertNPC(database, {
                type: "death-knight",
                name: "Death Knight",
                team: "Undead",
                tier: "boss",
                move_speed: 1,
                health: 250,
                health_regen: 0.03,
                mana: 100,
                mana_regen: 0.06,
                defense: 0.20,
                resistance: 0.75,
                abilities: {},
                gold_value: 35,
                xp_value: 50
            })
        ]);
    };
    return NPCsCollection;
}());
exports.NPCsCollection = NPCsCollection;
