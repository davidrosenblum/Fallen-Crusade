"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var websocket = require("websocket");
var mongodb_1 = require("mongodb");
var AccountCreateHandler_1 = require("./handlers/AccountCreateHandler");
var SettingsUtils_1 = require("./utils/SettingsUtils");
var DatabaseController_1 = require("./database/DatabaseController");
var GameController_1 = require("./game/GameController");
var NPCFactory_1 = require("./characters/NPCFactory");
var Server = (function () {
    function Server() {
        this._app = express().use(express.static(__dirname + "/../../web"));
        this._httpServer = http.createServer(this._app);
        this._wsServer = new websocket.server({ httpServer: this._httpServer });
        this._mongo = null;
        this._database = null;
        this._game = null;
        this._shuttingDown = false;
        this._wsServer.on("request", this.onWebSocket.bind(this));
        this.createRoutes();
        this.init();
    }
    Server.prototype.close = function () {
        var _this = this;
        this._httpServer.close(function () {
            _this._mongo.close();
            console.log("\nDatabase disconnected.");
            console.log("Server offline.\n");
        });
    };
    Server.prototype.onWebSocket = function (request) {
        var conn = request.accept(null, "*");
        this._game.handleConnection(conn);
    };
    Server.prototype.createRoutes = function () {
        var _this = this;
        this._app.get("/", function (req, res) { return res.sendFile("index.html"); });
        this._app.get("/killswitch/engage", function (req, res) {
            if (!_this._shuttingDown) {
                _this._shuttingDown = true;
                var s = 30;
                console.log("KILLSWITCH: ENGAGE");
                console.log("Terminating in " + s + " seconds.");
                setTimeout(function () { return _this.close(); }, 1000 * s);
            }
        });
        this._app.post("/accounts/create", function (req, res) {
            AccountCreateHandler_1.default.post(req, res, _this._database);
        });
    };
    Server.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var settings, mongoUri, mongoDbName, client, npcs, port_1, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        console.log("Loading settings...");
                        return [4, SettingsUtils_1.SettingsUtils.load()];
                    case 1:
                        settings = _a.sent();
                        console.log("Settings loaded.\n");
                        console.log("Connecting to MongoDB...");
                        mongoUri = process.env.MONGO_URI || settings.mongo_uri;
                        mongoDbName = mongoUri.split("/").pop();
                        return [4, mongodb_1.MongoClient.connect(mongoUri, { useNewUrlParser: true })];
                    case 2:
                        client = _a.sent();
                        console.log("Connected to database.\n");
                        this._database = new DatabaseController_1.DatabaseController(client.db(mongoDbName));
                        this._mongo = client;
                        this._game = new GameController_1.GameController(this._database, settings);
                        console.log("Loading game data...");
                        return [4, this._database.loadNPCs()];
                    case 3:
                        npcs = _a.sent();
                        NPCFactory_1.NPCFactory.setNPCTypes(npcs);
                        console.log("Game data loaded.\n");
                        port_1 = parseInt(process.env.PORT) || settings.port;
                        this._httpServer.listen(port_1, function () {
                            console.log("Server listening on port " + port_1 + ".\n");
                        });
                        return [3, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.log(err_1.message);
                        process.exit();
                        return [3, 5];
                    case 5: return [2];
                }
            });
        });
    };
    return Server;
}());
exports.Server = Server;
if (require.main === module) {
    new Server();
}
