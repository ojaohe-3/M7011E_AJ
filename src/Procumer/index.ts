import express = require("express");
import { Weather, Location } from "./weather";
import * as dotenv from "dotenv";
import {DB} from './DB-Connector/db-connector';
import { ProsumerSchema } from "./DB-Connector/prosumer";
const members = require('./members');
const control = require('./control');
dotenv.config({path: "./.env"});  

const sim_dest = process.env.SIM;
const pos = {lat: +process.env.LAT, lon: +process.env.LON}
const weather = new Weather(pos); 
const db = new DB({Prosumer : new ProsumerSchema().model})


const app: express.Application = express();

app.use(express.json());

let logger = (req, res, next) =>{ 
    console.log(`${req.protocol}://${req.get("host")}${req.originalUrl}: got  ${req.method}`)
    next();
}; 
app.use(logger);
app.use(express.json());

app.use("/api/members", members);
app.use("/api/control", control);

let PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});

