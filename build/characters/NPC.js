"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Unit_1 = require("./Unit");
var NPC = (function (_super) {
    __extends(NPC, _super);
    function NPC(config) {
        var _this = _super.call(this, config) || this;
        _this._tier = config.tier;
        _this._xpValue = config.xpValue || 0;
        _this._goldValue = config.goldValue || 0;
        _this._bountyGiven = false;
        return _this;
    }
    NPC.prototype.giveBounty = function () {
        if (!this._bountyGiven) {
            this._bountyGiven = true;
            this.map.giveBounty(this.xpValue, this.goldValue);
        }
    };
    Object.defineProperty(NPC.prototype, "tier", {
        get: function () {
            return this._tier;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NPC.prototype, "xpValue", {
        get: function () {
            return this._xpValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NPC.prototype, "goldValue", {
        get: function () {
            return this._goldValue;
        },
        enumerable: true,
        configurable: true
    });
    return NPC;
}(Unit_1.Unit));
exports.NPC = NPC;
