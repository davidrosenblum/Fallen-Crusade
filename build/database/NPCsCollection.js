"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NPCsCollection = (function () {
    function NPCsCollection() {
    }
    NPCsCollection.createCollections = function (database) {
        database.createCollection("npcs").then(function () {
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
    return NPCsCollection;
}());
exports.NPCsCollection = NPCsCollection;
