"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const monitor_1 = __importDefault(require("./monitor"));
const app = express_1.Router();
app.get('/monitor', async (req, res) => {
    const monitor = monitor_1.default.instant;
    res.json({
        traffic: monitor.traffic_graph,
        total_read_log: Math.log10(monitor.read_traffic + 1),
        total_write_log: Math.log10(monitor.write_traffic + 1),
        rate: monitor.rate_of_traffic
    });
});
exports.default = app;
