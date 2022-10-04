"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const https_1 = require("https");
const websockethandler_1 = __importDefault(require("./websockethandler"));
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const fs = require('fs');
const credentials = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
};
app_1.default.set("port", PORT);
const server = https_1.createServer(credentials, app_1.default);
const handler = new websockethandler_1.default(server);
server.listen(app_1.default.get("port"), () => {
    console.log(`Server Listening on port ${PORT}`);
});
