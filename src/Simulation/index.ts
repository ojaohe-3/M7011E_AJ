
import express = require("express");
import { Weather, Position } from "./weather";
import { Simulator } from "./simulation";
import {DB} from './../DB-Connector/db-connector'
import { CellSchema } from "../DB-Connector/cell";
import { ConsumerSchema } from "../DB-Connector/consumer";
require('dotenv').config();
//todo create modules to clean this file
const app: express.Application = express();
app.use(express.json());
let logger = (req, res, next) =>{
    console.log(`at ${(new Date()).toString()}: ${req.protocol}://${req.get("host")}${req.originalUrl}: ${req.method} request`)
    next();
}; 
//todo authentication middleware

const db = new DB({Cell: new CellSchema().model, Consumer: new ConsumerSchema().model});
const id = process.env.SIM_ID;


//todo fetch cell from data base, Init Simulator, get Health status of all services, add all managers and procumers if they are available, otherwise wait and store all data in a cache.

const pos: Position = {lat: 65.58415, lon: 22.15465} //todo database entry get
let simulation : Simulator;
const get_table = async()=> {
    const table = await DB.Models.Cell.findOne({_id: id}).exec();
    if(table){
        pos.lat = +table.lat;
        pos.lon = +table.lon;
        
    }else{
         simulation = new Simulator(pos, "", ""); //todo default parameters if db entry does not exist
    }
    simulation = new Simulator(pos, table.prosumer_dest, table.manager_dest);
    setInterval(Simulator.singelton.tick, 1000);
};


const consumer = require('./members/api_consumer');
const prosumer = require('./members/api_prosumer');
const manager = require('./members/api_manager');
const simdata = require('./members/api_collected_data');

app.use(logger);

app.use('/api/members/consumers', consumer);
app.use('/api/members/prosumers', prosumer);
app.use('/api/members/managers', manager);
app.use('/api/members/data', simdata);
   

const PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});

//todo fetch simulation data from managers
//todo fetch siumlation data from procumers

//todo publish change to database async
//todo async get weather module data and simulate tick.

//keep profiles updates

