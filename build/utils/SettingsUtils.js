"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var SettingsUtils = (function () {
    function SettingsUtils() {
    }
    SettingsUtils.provideDefaultOpts = function (settings) {
        for (var opt in this.defaultSettings) {
            if (typeof settings[opt] !== typeof this.defaultSettings[opt]) {
                settings[opt] = this.defaultSettings[opt];
            }
        }
        return settings;
    };
    SettingsUtils.load = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fs.readFile(_this.getAbsolutePath(), function (err, buffer) {
                if (!err) {
                    var json = null;
                    try {
                        json = JSON.parse(buffer.toString());
                    }
                    catch (err) {
                        reject(err);
                        return;
                    }
                    resolve(_this.provideDefaultOpts(json));
                }
                else if (err.errno === -4058) {
                    _this.writeDefault()
                        .then(function (settings) { return resolve(settings); })
                        .catch(function (err) { return reject(err); });
                }
                else
                    reject(err);
            });
        });
    };
    SettingsUtils.writeDefault = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var settingsCopy = _this.copyDefaultSettings();
            fs.writeFile(_this.getAbsolutePath(), JSON.stringify(settingsCopy, null, 4), function (err) {
                err ? reject(err) : resolve(settingsCopy);
            });
        });
    };
    SettingsUtils.getAbsolutePath = function () {
        return __dirname + "/" + this.PATH;
    };
    SettingsUtils.copyDefaultSettings = function () {
        return Object.assign({}, this.defaultSettings);
    };
    SettingsUtils.PATH = "settings.json";
    SettingsUtils.defaultSettings = {
        port: 8080,
        mongo_uri: "mongodb://localhost:27017/fallen_crusade"
    };
    return SettingsUtils;
}());
exports.SettingsUtils = SettingsUtils;
