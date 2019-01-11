"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JsonUtils = (function () {
    function JsonUtils() {
    }
    JsonUtils.parseString = function (str, callback) {
        var json = null;
        try {
            json = JSON.parse(str);
        }
        catch (err) {
            callback(err, null);
            return;
        }
        callback(null, json);
    };
    return JsonUtils;
}());
exports.JsonUtils = JsonUtils;
