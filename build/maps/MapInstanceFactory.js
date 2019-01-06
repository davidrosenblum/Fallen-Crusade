"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Maps_1 = require("./Maps");
var MapInstanceFactory = (function () {
    function MapInstanceFactory() {
    }
    MapInstanceFactory.create = function (type) {
        switch (type) {
            case "Village Center":
                return new Maps_1.VillageCenter();
            case "Northern Keep":
                return new Maps_1.NorthernKeep();
            default:
                throw new Error("Invalid map type.");
        }
    };
    MapInstanceFactory.createDefaultMaps = function () {
        return {
            "Village Center": new Maps_1.VillageCenter(),
            "Northern Keep": new Maps_1.NorthernKeep()
        };
    };
    return MapInstanceFactory;
}());
exports.MapInstanceFactory = MapInstanceFactory;
