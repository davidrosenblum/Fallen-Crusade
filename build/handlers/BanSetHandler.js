"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BanSetHandler = (function () {
    function BanSetHandler() {
    }
    BanSetHandler.prototype.options = function (req, res) {
        res.writeHead(204, BanSetHandler.httpHeaders);
        res.end();
    };
    BanSetHandler.prototype.get = function (req, res, dbc) {
        var secretKey = req.query["key"];
        if (secretKey !== "crucible33") {
            res.writeHead(403, BanSetHandler.httpHeaders);
            res.end("Unauthorized access (bad auth).");
            return;
        }
        var username = req.query["username"] || null;
        if (!username) {
            res.writeHead(400, BanSetHandler.httpHeaders);
            res.end("Please provide a username.");
            return;
        }
        if (req.query["ban"] !== "true" && req.query["ban"] !== "false") {
            res.writeHead(400, BanSetHandler.httpHeaders);
            res.end("Please specify ban=true or ban=false.");
            return;
        }
        var ban = req.query["ban"] === "true";
        dbc.updateAccountBan(username, ban)
            .then(function (response) {
            res.writeHead(200, BanSetHandler.httpHeaders);
            res.end(response);
        })
            .catch(function (err) {
            res.writeHead(400, BanSetHandler.httpHeaders);
            res.end("Database error: " + err.message);
        });
    };
    BanSetHandler.httpHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Fallen-Crusade-Key",
    };
    return BanSetHandler;
}());
exports.default = new BanSetHandler();
