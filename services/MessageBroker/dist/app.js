"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = express_1.default();
const options = {
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'X-Access-Token',
    ],
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: process.env.API_URL || 'localhost',
    preflightContinue: false,
};
app.use(cors_1.default(options));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: false
}));
let logger = (req, res, next) => {
    console.log(`at ${(new Date()).toString()}: ${req.protocol}://${req.get("host")}${req.originalUrl}: ${req.method} request`);
    next();
};
app.use(logger);
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.set('Content-Type', 'application/json');
    next();
});
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500);
    res.send("Error Occured!\nPlease try again later");
});
const api_1 = __importDefault(require("./api"));
app.use("/api/", api_1.default);
exports.default = app;
