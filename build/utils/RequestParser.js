"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestParser = (function () {
    function RequestParser() {
    }
    RequestParser.parseHttpJson = function (req) {
        return new Promise(function (resolve, reject) {
            var buffer = [];
            req.on("error", function (err) { return reject(err); });
            req.on("data", function (chunk) { return buffer.push(chunk); });
            req.on("end", function () {
                var json = null;
                try {
                    json = JSON.parse(buffer.join(""));
                }
                catch (err) {
                    reject(err);
                    return;
                }
                resolve(json);
            });
        });
    };
    return RequestParser;
}());
exports.RequestParser = RequestParser;
