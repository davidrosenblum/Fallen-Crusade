"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var TokenGenerator_1 = require("../utils/TokenGenerator");
var Character = (function (_super) {
    __extends(Character, _super);
    function Character(config) {
        var _this = _super.call(this) || this;
        _this._objectID = Character.tokenGen.nextToken();
        _this._ownerID = config.ownerID;
        _this._name = config.name;
        _this._type = config.type;
        _this._team = config.team || null;
        _this._x = config.x || 0;
        _this._y = config.y || 0;
        _this._anim = config.anim || null;
        _this._moveSpeed = Math.abs(config.moveSpeed) || 1;
        return _this;
    }
    Character.prototype.inRange = function (target, range) {
        if (this.x + range < target.x + range && target.x + range < this.x + range) {
            if (this.y + range < target.y + range && target.y + range < this.y + range) {
                return true;
            }
        }
        return false;
    };
    Character.prototype.setState = function (state) {
        var _a = state.x, x = _a === void 0 ? undefined : _a, _b = state.y, y = _b === void 0 ? undefined : _b, _c = state.anim, anim = _c === void 0 ? undefined : _c;
        if (x) {
            this._x = x;
        }
        if (y) {
            this._y = y;
        }
        if (anim) {
            this._anim = anim;
        }
        this.emit("state-update", { x: x, y: y, anim: anim });
    };
    Character.prototype.getUpateState = function () {
        return {
            objectID: this.objectID,
            x: this.x,
            y: this.y,
            anim: this.anim
        };
    };
    Character.prototype.getSpawnState = function () {
        return {
            objectID: this.objectID,
            ownerID: this.ownerID,
            name: this.name,
            type: this.type,
            team: this.team,
            x: this.x,
            y: this.y,
            anim: this.anim,
            moveSpeed: this.moveSpeed
        };
    };
    Object.defineProperty(Character.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (x) {
            this.setState({ x: x });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Character.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (y) {
            this.setState({ y: y });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Character.prototype, "anim", {
        get: function () {
            return this._anim;
        },
        set: function (anim) {
            this.setState({ anim: anim });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Character.prototype, "objectID", {
        get: function () {
            return this._objectID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Character.prototype, "ownerID", {
        get: function () {
            return this._ownerID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Character.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Character.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Character.prototype, "team", {
        get: function () {
            return this._team;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Character.prototype, "moveSpeed", {
        get: function () {
            return this._moveSpeed;
        },
        enumerable: true,
        configurable: true
    });
    Character.tokenGen = new TokenGenerator_1.TokenGenerator();
    return Character;
}(events_1.EventEmitter));
exports.Character = Character;
