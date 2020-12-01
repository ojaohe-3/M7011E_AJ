
import express = require("express");
import { Weather } from "../Procumer/weather";
import { Consumer } from "./consumer";
import { Manager } from "./manager";
import { Procumer } from "./procumer";
import { Simulator } from "./simulation";
// const fetch = require("node-fetch");

// const weather = new Weather({lat:0, lon:0});

//todo create modules to clean this file
const app: express.Application = express();
app.use(express.json());
let logger = (req, res, next) =>{
    console.log(`${req.protocol}://${req.get("host")}${req.originalUrl}: got ${req.method}`)
    next();
}; 
const pos = {lat: 65.58415, lon: 22.15465} //todo database entry get
const simulation = new Simulator(pos);
const weather = new Weather(pos)
setInterval(simulation.tick, 1000);//update simulation every second
//todo get simulation data from db
//todo make a checkout and cach 

const consumer = require('./members/api_consumer');
const prosumer = require('./members/api_procumer');
const manager = require('./members/api_manager');
const simdata = require('./members/api_collected_data');

app.use('/api/members/consumers', consumer);
app.use('/api/members/procumers', prosumer);
app.use('/api/members/managers', manager);
app.use('/api/members/simdata', simdata);
   









const PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);``
});0


//todo fetch simulation data from managers
//todo fetch siumlation data from procumers

//todo publish change to database async
//todo async get weather module data and simulate tick.

//keep profiles updates

