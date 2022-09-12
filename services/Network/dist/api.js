"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticator_1 = __importDefault(require("./authentication/authenticator"));
const NetworkHandler_1 = __importDefault(require("./handler/NetworkHandler"));
const app = express_1.Router();
const net = NetworkHandler_1.default.instance;
net.fetchAll();
app.get('/', async (req, res) => {
    await net.fetchAll();
    res.json(net.getAll());
});
app.post('/', authenticator_1.default("admin"), (req, res) => {
    try {
        const data = req.body;
        net.addNet(data);
        res.json({ message: "success!" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error when trying to post an invalid format', error: error });
    }
});
app.delete('/:id', authenticator_1.default("admin"), (req, res) => {
    try {
        const id = req.params.id;
        net.deleteNet(id);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Could not parse id', error: error });
    }
});
app.get('/:id', (req, res) => {
    const id = req.params.id;
    const member = net.get(id);
    if (member) {
        res.json(member);
    }
    else {
        res.status(404).json({ message: "not found", status: 404 });
    }
});
exports.default = app;
