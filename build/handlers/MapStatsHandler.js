"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapStatsHandler = (function () {
    function MapStatsHandler() {
    }
    MapStatsHandler.prototype.options = function (req, res) {
        res.writeHead(204, MapStatsHandler.httpHeaders);
        res.end();
    };
    MapStatsHandler.prototype.get = function (req, res, gc) {
        res.writeHead(200, MapStatsHandler.httpHeaders);
        res.end(JSON.stringify(gc.getMapStats(), null, 4));
    };
    MapStatsHandler.httpHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Access-Control-Allow-Origin",
    };
    return MapStatsHandler;
}());
exports.default = new MapStatsHandler();
