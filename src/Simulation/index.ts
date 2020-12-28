
import express = require("express");
import { Simulator } from "./simulation";
import {DB} from './DB-Connector/db-connector'
import { CellSchema } from "./DB-Connector/cell";
import { ConsumerSchema } from "./DB-Connector/consumer";
require('dotenv').config();
import cors = require("cors");
import { Types } from "mongoose";
import { Consumer } from "./consumer";
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

fetchAll();



const consumer = require('./members/api_consumer');
const prosumer = require('./members/api_prosumer');
const manager = require('./members/api_manager');
const simdata = require('./members/api_collected_data');

app.use(logger);
app.use(cors());// vanurability, cross origin sharing, allows some xss

app.use('/api/members/consumers', consumer);
app.use('/api/members/prosumers', prosumer);
app.use('/api/members/managers', manager);
app.use('/api/data', simdata);
   

const PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});


//keep profiles updates

async function fetchAll() {
    try { //todo fix initial condition, in case of newly generated nodes
        const sim_data = await DB.Models.Cell.findById(Types.ObjectId(id)).exec();
        const sim = new Simulator({lat: +sim_data.lat, lon: +sim_data.lon}, sim_data.manager_dest, sim_data.prosumer_dest);
        console.log("simulator loaded!");
        Simulator.singelton = sim;
        const data = await DB.Models.Consumer.find({name: process.env.NAME}).exec();
        data.forEach(c => sim.consumers.set(c.id, new Consumer(c.id,c.timefn, c.demand, c.profile)));
        setInterval(Simulator.singelton.tick, 1000);
    } catch (error) {
        console.log(error)
    }
    
    
}