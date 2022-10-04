"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const ws_1 = __importDefault(require("ws"));
const monitor_1 = __importDefault(require("./monitor"));
const HEARTBEAT_TIMEOUT_MS = 60000;
class WebSocketHandler {
    constructor(server) {
        this._number_messages = 0;
        this.wss = new ws_1.default.Server({ server });
        this.clients = {};
        this.pubs = {};
        this.subs = {};
        this.sockets = {};
        this.wss.on("connection", (ws, req) => {
            const id = crypto_1.randomUUID();
            const ip = req.socket.remoteAddress;
            const auth = req.headers.authorization;
            console.log(ip, "connected, assigning", id, "to client");
            this.clients[ip.toString()] = {
                id: id,
                timestamp: Date.now(),
            };
            this.sockets[id] = ws;
            monitor_1.default.instant.number_of_active_connections += 1;
            monitor_1.default.instant.number_of_connections += 1;
            ws.on("error", (err) => this.handleError(err));
            ws.on("close", (close) => {
                console.log("closing code", close);
                this.handleClose(ip);
            });
            ws.on("message", (msg) => this.handleMessage(msg, ws, ip));
        });
        setInterval(this.heartbeat.bind(this), HEARTBEAT_TIMEOUT_MS);
        this.exchanges = new Set();
    }
    handleMessage(msg, ws, ip) {
        try {
            monitor_1.default.instant.read_traffic += 1;
            this._number_messages += 1;
            const raw = msg.toString();
            const form = JSON.parse(raw);
            this.clients[ip].timestamp = Date.now();
            const client = this.clients[ip];
            switch (form.kind) {
                case "exchange":
                    ws.send({ exists: this.exchanges.has(form.key) });
                    break;
                case "publish":
                    this.exchanges.add(form.key);
                    const pub_client = { ...this.clients[ip] };
                    if (this.pubs[form.key]) {
                        this.pubs[form.key].push(pub_client);
                    }
                    else {
                        this.pubs[form.key] = [pub_client];
                    }
                    break;
                case "query":
                    const raw = [];
                    this.exchanges.forEach((value) => raw.push(value));
                    ws.send({ exchanges: raw });
                    break;
                case "subscribe":
                    const sub_client = { ...this.clients[ip] };
                    if (this.subs[form.key]) {
                        this.subs[form.key].push(sub_client);
                    }
                    else {
                        this.subs[form.key] = [sub_client];
                    }
                    break;
                case "unsubscribe":
                    const items = this.subs[form.key].filter(c => c.id !== client.id);
                    this.subs[form.key] = [...items];
                case "data":
                    this.sendToSubscribers(form);
                    break;
            }
        }
        catch (error) {
            this.handleError(error);
        }
    }
    handleError(err) {
        console.log("socket error: ", err);
    }
    handleClose(ip) {
        console.log("closing", ip);
        const uuid = this.clients[ip]?.id;
        if (!uuid) {
            return;
        }
        this.sockets[uuid].close();
        delete this.sockets[uuid];
        if (this.pubs[ip]) {
            delete this.pubs[ip];
        }
        if (this.subs[ip]) {
            delete this.subs[ip];
        }
        delete this.clients[ip];
        monitor_1.default.instant.number_of_active_connections -= 1;
    }
    sendToSubscribers(form) {
        if (this.exchanges.has(form.key ?? "")) {
            Object.entries(this.subs[form.key]).map(([key, val]) => {
                const ws = this.sockets[val.id];
                const send = { ...form };
                delete send.kind;
                delete send.key;
                ws.send(JSON.stringify(send));
                this._number_messages += 1;
                monitor_1.default.instant.write_traffic += 1;
            });
        }
    }
    heartbeat() {
        monitor_1.default.instant.push_to_average(this._number_messages);
        this._number_messages = 0;
        Object.entries(this.clients).forEach(([ip, c]) => {
            if (Date.now() - c.timestamp > HEARTBEAT_TIMEOUT_MS) {
                this.handleClose(ip);
            }
        });
    }
}
exports.default = WebSocketHandler;
