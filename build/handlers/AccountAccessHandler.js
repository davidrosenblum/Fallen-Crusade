"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AccountAccessHandler = (function () {
    function AccountAccessHandler() {
    }
    AccountAccessHandler.prototype.options = function (req, res) {
        res.writeHead(204, AccountAccessHandler.httpHeaders);
        res.end();
    };
    AccountAccessHandler.prototype.get = function (req, res, dbc) {
        var secretKey = req.query["key"];
        if (secretKey !== "crucible33") {
            res.writeHead(403, AccountAccessHandler.httpHeaders);
            res.end("Unauthorized access (bad auth).");
            return;
        }
        var accessLevel = parseInt(req.query["access_level"]) || 2;
        var username = req.query["username"] || null;
        if (!username) {
            res.writeHead(400, AccountAccessHandler.httpHeaders);
            res.end("Please provide a username.");
            return;
        }
        dbc.updateAccessLevel(username, accessLevel)
            .then(function (response) {
            res.writeHead(200, AccountAccessHandler.httpHeaders);
            res.end(response);
        })
            .catch(function (err) {
            res.writeHead(400, AccountAccessHandler.httpHeaders);
            res.end("Database error: " + err.message);
        });
    };
    AccountAccessHandler.httpHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Fallen-Crusade-Key",
    };
    return AccountAccessHandler;
}());
exports.default = new AccountAccessHandler();
