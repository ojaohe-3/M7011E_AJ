"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var db_connector_1 = require("../DB-Connector/db-connector");
var network_1 = require("../models/network");
var RabbitSeverHandler_1 = require("./RabbitSeverHandler");
var NetworkHandler = /** @class */ (function () {
    function NetworkHandler() {
        var _this = this;
        this._networks = new Map();
        RabbitSeverHandler_1["default"].instance.on("receive_msg", function (msg) {
            if (msg) {
                var channel = msg.channel, content = msg.content, target = msg.target;
                console.log("info { ch: " + channel + " cnt: " + content + " trg: " + target + " }");
                var network = _this._networks.get(target);
                var sources_1 = [];
                var consumers_1 = [];
                content.forEach(function (v) {
                    var _a, _b;
                    // console.log(v)
                    switch (v.key_type.toLowerCase()) {
                        case "consumer":
                            consumers_1.push({
                                id: v.id,
                                demand: v.amount,
                                time_stamp: (_a = v.time_stamp) !== null && _a !== void 0 ? _a : 0,
                                updated: false
                            });
                            break;
                        case "source":
                            sources_1.push({
                                id: v.id,
                                price: v.price,
                                output: v.amount,
                                demand: v.additional || 0,
                                time_stamp: (_b = v.time_stamp) !== null && _b !== void 0 ? _b : 0,
                                updated: false
                            });
                            break;
                    }
                });
                var tickets = network === null || network === void 0 ? void 0 : network.tick(consumers_1, sources_1);
                // console.log(tickets)
                // channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(tickets || [])), correlationID)
            }
        });
        // RabbitHandler.instance.createChannel("datamonitor");
    }
    Object.defineProperty(NetworkHandler, "instance", {
        get: function () {
            return this._instance ? this._instance : new NetworkHandler();
        },
        enumerable: false,
        configurable: true
    });
    NetworkHandler.prototype.fetchAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var entry, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db_connector_1.DB.Models.Network.find()];
                    case 1:
                        entry = _a.sent();
                        entry.forEach(function (m) {
                            var id = m._id.toHexString();
                            var _net = {
                                id: id,
                                tickets: m.tickets,
                                name: m.name,
                                updatedAt: m.updatedAt
                            };
                            var network = new network_1["default"](_net);
                            _this._networks.set(m.name, network);
                            // console.log(this._networks) 
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.log(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    NetworkHandler.prototype.getAll = function () {
        return Array.from(this._networks.values());
    };
    NetworkHandler.prototype.addNet = function (data) {
        if (data.name) {
            var id = data.id || mongoose_1.Types.ObjectId.createFromTime(Date.now()).toHexString();
            var net = new network_1["default"]({ id: id, name: data.name, tickets: data.tickets || [], updatedAt: data.updatedAt || new Date() });
            this._networks.set(net.id, net);
            net.document();
        }
        else {
            var net = new network_1["default"]();
            this._networks.set(net.id, net);
            net.document();
        }
    };
    NetworkHandler.prototype.get = function (id) {
        return this._networks.get(id);
    };
    NetworkHandler.prototype.deleteNet = function (id) {
        this._networks["delete"](id);
    };
    return NetworkHandler;
}());
exports["default"] = NetworkHandler;
