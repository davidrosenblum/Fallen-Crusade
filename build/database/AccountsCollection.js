"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TokenGenerator_1 = require("../utils/TokenGenerator");
var AccountData_1 = require("./AccountData");
var AccountsCollection = (function () {
    function AccountsCollection() {
    }
    AccountsCollection.createCollections = function (database) {
        database.createCollection("accounts").then(function () {
            database.collection("accounts").createIndex("username", { unique: true });
        });
        database.createCollection("salts").then(function () {
            database.collection("salts").createIndex("username", { unique: true });
        });
    };
    AccountsCollection.createAccount = function (database, username, password) {
        return new Promise(function (resolve, reject) {
            var salt = TokenGenerator_1.TokenGenerator.anyToken(AccountsCollection.PASSWORD_LENGTH - password.length);
            var hash = TokenGenerator_1.TokenGenerator.hashToken(password + salt);
            var accountDoc = {
                username: username, password: hash, enabled: true, access_level: 1, date_joined: Date.now()
            };
            var saltDoc = {
                username: username, salt: salt
            };
            database.collection("accounts").insertOne(accountDoc)
                .then(function () {
                database.collection("salts").insertOne(saltDoc)
                    .then(function () {
                    resolve("Account \"" + username + "\" created.");
                })
                    .catch(function (err) {
                    database.collection("accounts").deleteOne({ username: username });
                    reject(err);
                });
            })
                .catch(function (err) {
                if (err.code === 11000) {
                    reject(new Error("Account \"" + username + "\" already exists."));
                }
                else
                    reject(err);
            });
        });
    };
    AccountsCollection.getAccount = function (database, username, password) {
        return new Promise(function (resolve, reject) {
            database.collection("accounts").findOne({ username: username })
                .then(function (accountDoc) {
                if (accountDoc) {
                    if (accountDoc.enabled) {
                        AccountsCollection.getSalt(database, username)
                            .then(function (saltDoc) {
                            var hash = TokenGenerator_1.TokenGenerator.hashToken(password + saltDoc.salt);
                            if (accountDoc.password === hash) {
                                resolve(new AccountData_1.AccountData(accountDoc._id.toString(), accountDoc.username, accountDoc.access_level));
                            }
                            else
                                reject(new Error("Wrong password."));
                        })
                            .catch(function (err) { return reject(err); });
                    }
                    else
                        reject(new Error("Account \"" + username + "\" is locked."));
                }
                else
                    reject(new Error("Account \"" + username + "\" does not exist."));
            })
                .catch(function (err) { return reject(err); });
        });
    };
    AccountsCollection.getSalt = function (database, username) {
        return new Promise(function (resolve, reject) {
            database.collection("salts").findOne({ username: username })
                .then(function (result) {
                result ? resolve(result) : reject(new Error("Salt not found."));
            })
                .catch(function (err) { return reject(err); });
        });
    };
    AccountsCollection.PASSWORD_LENGTH = 64;
    return AccountsCollection;
}());
exports.AccountsCollection = AccountsCollection;
