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
var crypto_1 = require("crypto");
var mongoose_1 = require("mongoose");
var db_connector_1 = require("../DB-Connector/db-connector");
var RabbitSeverHandler_1 = require("../handler/RabbitSeverHandler");
var env = process.env.MAX_TICKETS_BACKLOG;
var MAX_LENGHT_TICKETS_BACKLOG = env ? +env : 10000;
var TIME_DELTA_MS = 1000;
var Network = /** @class */ (function () {
    function Network(network) {
        this._netpower = 0;
        this._consumers = {};
        this._suppliers = {};
        this._last_update = Date.now() - TIME_DELTA_MS * 2;
        this._total_demand = 0;
        this._total_supply = 0;
        if (network) {
            this.tickets = network.tickets;
            this.updatedAt = network.updatedAt;
            this.name = network.name;
            this.id = network.id;
        }
        else {
            var rid = crypto_1.randomUUID();
            this.id = mongoose_1.Types.ObjectId.createFromTime(Date.now()).toHexString();
            this.tickets = [];
            this.name = 'network-' + rid;
            this.updatedAt = new Date();
            this.document();
        }
        this.init_rmq();
        RabbitSeverHandler_1["default"].instance.on("clear", this.clear_tickets);
    }
    Object.defineProperty(Network.prototype, "total_demand", {
        get: function () {
            return this._total_demand;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Network.prototype, "total_supply", {
        get: function () {
            return this._total_supply;
        },
        enumerable: false,
        configurable: true
    });
    //#region getters and setters
    Network.prototype.init_rmq = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, RabbitSeverHandler_1["default"].instance.createChannel(this.name)];
                    case 1:
                        result = _a.sent();
                        if (result) {
                            console.log("created channel", this.name);
                        }
                        else {
                            setTimeout(function () { return _this.init_rmq(); }, 2000);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Network.prototype, "netpower", {
        get: function () {
            return this._netpower;
        },
        set: function (value) {
            this._netpower = value;
        },
        enumerable: false,
        configurable: true
    });
    //#endregion
    Network.prototype.addSuppliers = function () {
        var _this = this;
        var sources = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            sources[_i] = arguments[_i];
        }
        sources.forEach(function (s) { return _this._suppliers[s.id] = s; });
    };
    Network.prototype.addConsumers = function () {
        var _this = this;
        var consumers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            consumers[_i] = arguments[_i];
        }
        consumers.forEach(function (c) { return _this._consumers[c.id] = c; });
    };
    Network.prototype.removeSupplier = function (s) {
        delete this._suppliers[s.id];
    };
    Network.prototype.removeConsumer = function (c) {
        delete this._consumers[c.id];
    };
    Network.prototype.document = function () {
        return __awaiter(this, void 0, void 0, function () {
            var body, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        body = {
                            updatedAt: this.updatedAt,
                            _id: this.id,
                            name: this.name,
                            tickets: this.tickets
                        };
                        return [4 /*yield*/, db_connector_1.DB.Models.Network.findByIdAndUpdate(this.id, body, {
                                upsert: true
                            }).exec()];
                    case 1:
                        _a.sent();
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
    Network.prototype.tick = function (demanders, producers) {
        var _a;
        var _this = this;
        // Add and update all nodes
        this.addSuppliers.apply(this, producers);
        this.addConsumers.apply(this, demanders);
        // Lets multiple nodes update the same tick
        var time_stamp = Date.now() - TIME_DELTA_MS;
        if (this._last_update - Date.now() > TIME_DELTA_MS) {
            this._total_demand = 0;
            this._total_supply = 0;
        }
        // sum demand and output from entries in suppliers, e.g. prosumers demand and output. 
        Object.entries(this._suppliers).forEach(function (_a) {
            var k = _a[0], s = _a[1];
            if (s.updated != true && s.time_stamp <= s.time_stamp) {
                _this._total_demand += s.demand;
                _this._total_supply += s.output;
                _this._suppliers[k].updated = true; /// should be negated when RabbitMQHandler received new value.
            }
        });
        // sum demand from consumers only
        Object.entries(this._consumers).forEach(function (_a) {
            var k = _a[0], c = _a[1];
            if (c.updated != true && c.time_stamp <= c.time_stamp) {
                _this._total_demand += c.demand;
                _this._consumers[k].updated = true;
            }
        });
        var total_demand = this._total_demand;
        var total_supply = this._total_supply;
        console.log("demand:", total_demand, "supply:", total_supply, "at:", new Date(time_stamp));
        var tickets = [];
        var consumer = demanders.pop();
        var producer = producers.pop();
        // While we still have a consumer or prosumer left
        while (consumer && producer) {
            // supply the producer first 
            var supply = producer.output - producer.demand;
            // tickets infere where the energy was tacken from, it can be from multiple sources
            if (producer.demand > 0) {
                tickets.push({
                    target: producer.id,
                    price: 0,
                    source: producer.id,
                    amount: supply > 0 ? producer.demand : producer.output
                });
            }
            // demander has demand, producer exist and there is supply
            while (consumer !== undefined && producer !== undefined && supply > 0) {
                // take from supply
                var take = supply - consumer.demand;
                // if we dont have enough supply to take
                if (take > 0) {
                    // otherwise supply demander with all.
                    supply -= consumer.demand;
                    tickets.push({
                        target: consumer.id,
                        price: take * producer.price,
                        source: producer.id,
                        amount: take
                    });
                    console.log(consumer.id, "took", take, "from", producer.id);
                    consumer = demanders.pop();
                }
            }
            producer = producers.pop();
        }
        this._netpower += total_supply - total_demand;
        this.updatedAt = new Date();
        (_a = this.tickets).push.apply(_a, tickets);
        // Defined 
        if (this.tickets.length >= MAX_LENGHT_TICKETS_BACKLOG) {
            RabbitSeverHandler_1["default"].instance.sendData("datamonitor", this.tickets);
            this.clear_tickets();
        }
        this.document();
        this._last_update = Date.now();
        return tickets;
    };
    Network.prototype.clear_tickets = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.tickets = [];
                        return [4 /*yield*/, this.document()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Network;
}());
exports["default"] = Network;
