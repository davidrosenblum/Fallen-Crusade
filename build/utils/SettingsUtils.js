"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var SettingsUtils = (function () {
    function SettingsUtils() {
    }
    SettingsUtils.provideDefaultOpts = function (settings) {
        for (var opt in SettingsUtils.defaultSettings) {
            if (typeof settings[opt] !== typeof SettingsUtils.defaultSettings[opt]) {
                settings[opt] = SettingsUtils.defaultSettings[opt];
            }
        }
        return settings;
    };
    SettingsUtils.load = function () {
        return new Promise(function (resolve, reject) {
            fs.readFile(SettingsUtils.PATH, function (err, buffer) {
                if (!err) {
                    var json = null;
                    try {
                        json = JSON.parse(buffer.toString());
                    }
                    catch (err) {
                        reject(err);
                        return;
                    }
                    resolve(SettingsUtils.provideDefaultOpts(json));
                }
                else if (err.errno === -4058) {
                    SettingsUtils.writeDefault()
                        .then(function (settings) { return resolve(settings); })
                        .catch(function (err) { return reject(err); });
                }
                else
                    reject(err);
            });
        });
    };
    SettingsUtils.writeDefault = function () {
        return new Promise(function (resolve, reject) {
            fs.writeFile(SettingsUtils.PATH, JSON.stringify(SettingsUtils.defaultSettings, null, 4), function (err) {
                var settingsCopy = Object.assign({}, SettingsUtils.defaultSettings);
                err ? reject(err) : resolve(settingsCopy);
            });
        });
    };
    SettingsUtils.PATH = "settings.json";
    SettingsUtils.defaultSettings = {
        port: 8080,
        mongo_uri: "mongodb://localhost:27017/fallen_crusade"
    };
    return SettingsUtils;
}());
exports.SettingsUtils = SettingsUtils;
