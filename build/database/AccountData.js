"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AccountData = (function () {
    function AccountData(accountID, username, accessLevel) {
        this._accountID = accountID;
        this._username = username;
        this._accessLevel = accessLevel;
    }
    Object.defineProperty(AccountData.prototype, "accountID", {
        get: function () {
            return this._accountID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AccountData.prototype, "username", {
        get: function () {
            return this._username;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AccountData.prototype, "accessLevel", {
        get: function () {
            return this._accessLevel;
        },
        enumerable: true,
        configurable: true
    });
    return AccountData;
}());
exports.AccountData = AccountData;
