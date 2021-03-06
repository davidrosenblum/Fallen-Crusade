"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CharactersCollection = (function () {
    function CharactersCollection() {
    }
    CharactersCollection.createCollections = function (database) {
        database.createCollection("characters").then(function () {
            database.collection("characters").createIndex("name", { unique: true });
        });
    };
    CharactersCollection.createCharacter = function (database, accountID, name, skin) {
        if (skin === void 0) { skin = 1; }
        return new Promise(function (resolve, reject) {
            var characterDoc = {
                account_id: accountID, name: name, skin: skin,
                level: 1, xp: 0, gold: 0, ability_points: 0, last_map: "Village Center",
                abilities: {
                    "incinerate": 1,
                    "fireball": 0,
                    "lightning-storm": 0,
                    "healing-touch": 0,
                    "arcane-barrier": 0
                }
            };
            database.collection("characters").insertOne(characterDoc)
                .then(function () { return resolve("Character \"" + name + "\" created."); })
                .catch(function (err) {
                if (err.code === 11000) {
                    reject(new Error("Character \"" + name + "\" already exists."));
                }
                else
                    reject(err);
            });
        });
    };
    CharactersCollection.getCharacter = function (database, accountID, name) {
        return new Promise(function (resolve, reject) {
            database.collection("characters").findOne({ account_id: accountID, name: name })
                .then(function (result) {
                result ? resolve(result) : reject(new Error("Character \"" + name + "\" not found."));
            })
                .catch(function (err) { return reject(err); });
        });
    };
    CharactersCollection.getCharacterList = function (database, accountID) {
        return new Promise(function (resolve, reject) {
            database.collection("characters").find({ account_id: accountID }).toArray()
                .then(function (results) {
                var previews = new Array(results.length);
                results.forEach(function (result, index) {
                    previews[index] = {
                        name: result.name,
                        level: result.level,
                        skin: result.skin,
                        last_map: result.last_map
                    };
                });
                resolve(previews);
            })
                .catch(function (err) { return reject(err); });
        });
    };
    CharactersCollection.deleteCharacter = function (database, accountID, name) {
        return new Promise(function (resolve, reject) {
            database.collection("characters").deleteOne({ account_id: accountID, name: name })
                .then(function () { return resolve("Character \"" + name + "\" deleted."); })
                .catch(function (err) { return reject(err); });
        });
    };
    CharactersCollection.updateCharacter = function (database, accountID, name, update) {
        return new Promise(function (resolve, reject) {
            var filter = { account_id: accountID, name: name };
            database.collection("characters").findOneAndUpdate(filter, update)
                .then(function (result) {
                if (result.lastErrorObject.n > 0) {
                    resolve("Update successful.");
                }
                else
                    reject(new Error("Nothing updated."));
            })
                .catch(function (err) { return reject(err); });
        });
    };
    return CharactersCollection;
}());
exports.CharactersCollection = CharactersCollection;
