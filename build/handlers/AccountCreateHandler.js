"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestParser_1 = require("../utils/RequestParser");
var AccountCreateHandler = (function () {
    function AccountCreateHandler() {
    }
    AccountCreateHandler.prototype.options = function (req, res) {
        res.writeHead(204, AccountCreateHandler.httpHeaders);
        res.end();
    };
    AccountCreateHandler.prototype.post = function (req, res, dbc) {
        RequestParser_1.RequestParser.parseHttpJson(req)
            .then(function (json) {
            var _a = json.username, username = _a === void 0 ? null : _a, _b = json.password, password = _b === void 0 ? null : _b;
            if (username && password) {
                dbc.createAccount(username, password)
                    .then(function (result) {
                    res.writeHead(200, AccountCreateHandler.httpHeaders);
                    res.end(result);
                })
                    .catch(function (err) {
                    res.writeHead(400, AccountCreateHandler.httpHeaders);
                    res.end(err.message);
                });
            }
            else {
                res.writeHead(400, AccountCreateHandler.httpHeaders);
                res.end("Invalid json schema.");
            }
        })
            .catch(function (err) {
            res.writeHead(400, AccountCreateHandler.httpHeaders);
            res.end(err.message);
        });
    };
    AccountCreateHandler.httpHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Access-Control-Allow-Origin"
    };
    return AccountCreateHandler;
}());
exports.default = new AccountCreateHandler();
