"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapStatsGetHandler = (function () {
    function MapStatsGetHandler() {
    }
    MapStatsGetHandler.prototype.options = function (req, res) {
        res.writeHead(204, MapStatsGetHandler.httpHeaders);
        res.end();
    };
    MapStatsGetHandler.prototype.get = function (req, res, gc) {
        res.writeHead(200, MapStatsGetHandler.httpHeaders);
        res.end(JSON.stringify(gc.getMapStats(), null, 4));
    };
    MapStatsGetHandler.httpHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Access-Control-Allow-Origin",
    };
    return MapStatsGetHandler;
}());
exports.MapStatsGetHandler = MapStatsGetHandler;
