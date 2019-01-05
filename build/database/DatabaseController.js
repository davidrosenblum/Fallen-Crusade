"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AccountsCollection_1 = require("./AccountsCollection");
var CharactersCollection_1 = require("./CharactersCollection");
var NPCsCollection_1 = require("./NPCsCollection");
var DatabaseController = (function () {
    function DatabaseController(database) {
        this._database = database;
        this.createCollections();
    }
    DatabaseController.prototype.close = function () {
        this._database;
    };
    DatabaseController.prototype.createCollections = function () {
        AccountsCollection_1.AccountsCollection.createCollections(this._database);
        CharactersCollection_1.CharactersCollection.createCollections(this._database);
        NPCsCollection_1.NPCsCollection.createCollections(this._database);
    };
    DatabaseController.prototype.createAccount = function (username, password) {
        return AccountsCollection_1.AccountsCollection.createAccount(this._database, username, password);
    };
    DatabaseController.prototype.getAccount = function (username, password) {
        return AccountsCollection_1.AccountsCollection.getAccount(this._database, username, password);
    };
    DatabaseController.prototype.createCharacter = function (accountID, name, skin) {
        return CharactersCollection_1.CharactersCollection.createCharacter(this._database, accountID, name, skin);
    };
    DatabaseController.prototype.getCharacter = function (accountID, name) {
        return CharactersCollection_1.CharactersCollection.getCharacter(this._database, accountID, name);
    };
    DatabaseController.prototype.getCharacterList = function (accountID) {
        return CharactersCollection_1.CharactersCollection.getCharacterList(this._database, accountID);
    };
    DatabaseController.prototype.deleteCharacter = function (accountID, name) {
        return CharactersCollection_1.CharactersCollection.deleteCharacter(this._database, accountID, name);
    };
    DatabaseController.prototype.updateCharacter = function () {
    };
    DatabaseController.prototype.loadNPCs = function () {
        return NPCsCollection_1.NPCsCollection.loadNPCs(this._database);
    };
    return DatabaseController;
}());
exports.DatabaseController = DatabaseController;
