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
var amqplib_1 = require("amqplib");
var WorkHandler_1 = require("./WorkHandler");
var RabbitHandler = /** @class */ (function () {
    function RabbitHandler() {
        this._connecting = false;
        this._connected = false;
        this._channels = new Map();
        this._workhandler = new WorkHandler_1["default"]();
        this.connect();
    }
    Object.defineProperty(RabbitHandler, "instance", {
        get: function () {
            if (this._instance === undefined) {
                this._instance = new RabbitHandler();
            }
            return this._instance;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RabbitHandler.prototype, "connected", {
        get: function () {
            return this._connected;
        },
        enumerable: false,
        configurable: true
    });
    RabbitHandler.prototype.on = function (key, handler) {
        return this._workhandler.on(key, handler);
    };
    RabbitHandler.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var opt, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this._connected || this._connecting)
                            return [2 /*return*/];
                        this._connecting = true;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        opt = {
                            credentials: amqplib_1.credentials.plain(process.env.RABBITMQ_USER || "user", process.env.RABBITMQ_PASS || "password")
                        };
                        console.log("connecting to", process.env.RABBITMQ_CONNECTION_STRING || 'amqp://localhost:5672');
                        _a = this;
                        return [4 /*yield*/, amqplib_1["default"].connect(process.env.RABBITMQ_CONNECTION_STRING || 'amqp://localhost:5672', opt)];
                    case 2:
                        _a._connector = _b.sent();
                        this._connected = true;
                        console.log("rabbitmq connected!");
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.log(error_1);
                        this._connected = false;
                        setTimeout(this.connect, 10000); // try to reconnect after 10s
                        this._connecting = false;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RabbitHandler.prototype.sendData = function (channel, data) {
        return __awaiter(this, void 0, Promise, function () {
            var json, c, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._connected) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        json = JSON.stringify(data);
                        if (!!this._channels.has(channel)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createChannel(channel)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        c = this._channels.get(channel);
                        c === null || c === void 0 ? void 0 : c.sendToQueue(channel, Buffer.from(json));
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.log(error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RabbitHandler.prototype.createChannel = function (name) {
        return __awaiter(this, void 0, Promise, function () {
            var c_1, q, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._connected === false) {
                            console.log("Not Connected!");
                            return [2 /*return*/, undefined];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        console.log("creating channel");
                        return [4 /*yield*/, this._connector.createChannel()];
                    case 2:
                        c_1 = _a.sent();
                        c_1.assertExchange(name, 'fanout', { durable: false });
                        return [4 /*yield*/, c_1.assertQueue("", { exclusive: true })];
                    case 3:
                        q = _a.sent();
                        return [4 /*yield*/, c_1.bindQueue(q.queue, name, "")];
                    case 4:
                        _a.sent();
                        c_1.consume(q.queue, function (msg) {
                            // console.log('recived message processing...', msg)
                            if (msg === null) {
                                console.log('received null!');
                                return;
                            }
                            var json = JSON.parse(msg === null || msg === void 0 ? void 0 : msg.content.toString());
                            _this._workhandler.run("receive_msg", { target: name, content: json, channel: c_1 });
                            //             c.ack(msg);
                        });
                        // this._channels.set(name, c);
                        console.log("created channel", name);
                        return [2 /*return*/, c_1];
                    case 5:
                        error_3 = _a.sent();
                        console.log(error_3);
                        return [2 /*return*/, undefined];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // public async createRPCChannel(name: string): Promise<client.Channel | undefined> {
    //     if (this._connected === false) {
    //         console.log("Not Connected!")
    //         return undefined;
    //     }
    //     try {
    //         const c = await this._connector.createChannel()
    //         c.assertQueue(name, { durable: false });
    //         c.prefetch(1);
    //         this._channels.set(name, c);
    //         c.consume(name, (msg) => {
    //             console.log('recived message processing...')
    //             if (msg === null) {
    //                 console.log('received null!')
    //                 return;
    //             }
    //             const json: ReceiveFormat[] = JSON.parse(msg?.content.toString());
    //             const cid = msg!.properties.correlationId;
    //             const replyTo = msg!.properties.replyTo;
    //             this._workhandler.run("receive_rpc", { target: name, content: json, channel: c, correlationID: cid, replyTo: replyTo })
    //             c.ack(msg);
    //         })
    //         return c;
    //     } catch (error) {
    //         console.log(error)
    //         return undefined
    //     }
    // }
    RabbitHandler.prototype.close = function () {
        this._connected = false;
        this._connector.close();
    };
    return RabbitHandler;
}());
exports["default"] = RabbitHandler;
