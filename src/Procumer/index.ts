import express = require("express");
import { Procumer } from "./procumer";
import uuid = require("uuid");


let id = process.env.ID || uuid.v4();
const procumers: Map<String, Procumer> = new Map<String, Procumer>();
//fetch from database, id and procumers
const app: express.Application = express();

app.use(express.json());

let logger = (req, res, next) =>{
    console.log('${req.protocol}://${req.get("host")}${req.originalUrl}: ${}')
    next();
}; 
app.use(express.json());


//api add procumer
app.post('/procumer');

let PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log("App is listening on port ${PORT}");
});