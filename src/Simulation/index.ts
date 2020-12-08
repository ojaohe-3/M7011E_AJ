
import express = require("express");
import { Weather } from "../Procumer/weather";
import { Consumer } from "./consumer";
import { Manager } from "./manager";
import { Procumer } from "./procumer";
import { Simulator } from "./simulation";


//todo create modules to clean this file
const app: express.Application = express();
app.use(express.json());
let logger = (req, res, next) =>{
    console.log(`at ${(new Date()).toString()}: ${req.protocol}://${req.get("host")}${req.originalUrl}: ${req.method} request`)
    next();
}; 
//todo authentication middleware

require( './../DB-Connector/db-connector');
const model = require('./../DB-Connector/cell');
const id = process.env.SIM_ID;

const table = model.fetchOne({_id: id});
//todo fetch cell from data base, Init Simulator, get Health status of all services, add all managers and procumers if they are available, otherwise wait and store all data in a cache.

const pos = {lat: 65.58415, lon: 22.15465} //todo database entry get
const simulation = new Simulator(pos);
const weather = new Weather(pos)
setInterval(simulation.tick, 1000);//update simulation every second
//todo get simulation data from db
//todo make a checkout and cach 

const consumer = require('./members/api_consumer');
const prosumer = require('./members/api_prosumer');
const manager = require('./members/api_manager');
const simdata = require('./members/api_collected_data');

app.use(logger);

app.use('/api/members/consumers', consumer);
app.use('/api/members/prosumers', prosumer);
app.use('/api/members/managers', manager);
app.use('/api/members/data.collection', simdata);
   

const PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});

//todo fetch simulation data from managers
//todo fetch siumlation data from procumers

//todo publish change to database async
//todo async get weather module data and simulate tick.

//keep profiles updates

