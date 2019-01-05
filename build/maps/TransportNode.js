"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TokenGenerator_1 = require("../utils/TokenGenerator");
var TransportNode = (function () {
    function TransportNode(type, text, map, col, row, outID, outCol, outRow) {
        this._nodeID = TransportNode.tokenGen.nextToken();
        this._type = type;
        this._text = text;
        this._spawnLocation = { col: col, row: row };
        this._map = map;
        this._outID = outID;
        this._outLocation = { col: outCol, row: outRow };
    }
    TransportNode.prototype.getTransportNodeState = function () {
        return {
            nodeID: this.nodeID,
            type: this.type,
            text: this.text,
            outID: this.outID,
            spawnLocation: Object.assign({}, this._spawnLocation),
            outLocation: Object.assign({}, this._outLocation)
        };
    };
    Object.defineProperty(TransportNode.prototype, "nodeID", {
        get: function () {
            return this._nodeID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransportNode.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransportNode.prototype, "text", {
        get: function () {
            return this._text;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TransportNode.prototype, "outID", {
        get: function () {
            return this._outID;
        },
        enumerable: true,
        configurable: true
    });
    TransportNode.tokenGen = new TokenGenerator_1.TokenGenerator(16);
    return TransportNode;
}());
exports.TransportNode = TransportNode;
