import express = require("express");
import { Procumer } from "./procumer";
import uuid = require("uuid");
import { Weather, Position } from "./weather";
import { Battery } from "./Battery";
import { Turbine } from "./Turbine";
import * as dotenv from "dotenv";
import {DB} from './DB-Connector/db-connector';
import { ProsumerSchema } from "./DB-Connector/prosumer";
import { Types } from "mongoose";
import Axios from "axios";
dotenv.config({path: "./.env"});  

const sim_dest = process.env.SIM;
const pos = {lat: +process.env.LAT, lon: +process.env.LON}
const weather = new Weather(pos); 
const db = new DB({Prosumer : new ProsumerSchema().model})



const procumers: Map<String, Procumer> = new Map<String, Procumer>();
//fetch from database, id and procumers
fetchAll();
const app: express.Application = express();

app.use(express.json());

let logger = (req, res, next) =>{ 
    console.log(`${req.protocol}://${req.get("host")}${req.originalUrl}: got  ${req.method}`)
    next();
}; 
app.use(logger);
app.use(express.json());


app.get('/api/member/:id', (req,res)=>{
    const data = procumers.get(req.params.id);
    if(data){
        data.tick(Weather.singleton.speed);
        res.json(data);
    }
    else
        res.status(400).json({messsage:"No such id"});
});
app.get('/api/members', (req,res)=>{
    const data = Array.from(procumers.values());
    if(data)
        res.json(data);
    else
        res.status(400).json({messsage: "No memebers!"});
});
//api add procumer
app.post('/api/members/', async (req, res)=>{ //todo restAPI stuff
    const format = ["turbines", "batteries"] //enforced members
    const data= req.body;
    if(Object.keys(data).filter(k=>format.some(e => k === e)).length === format.length){
        const b = data.batteries;
        const t = data.turbines;
        let bc:Array<Battery> = [];
        let tc:Array<Turbine> = []; 
        //unsafe but must be done we assume it is completed if the key exist
        b.forEach(e => bc.push(new Battery(e.capacity, e.maxOutput, e.maxCharge)));
        t.forEach(e => tc.push(new Turbine(e.maxPower)));
        const id =  data.id ? data.id :Types.ObjectId().toHexString();

        const prosumer = new Procumer(bc,tc, id);
        procumers.set(id, prosumer);
        await prosumer.document(); 
        //todo make sure data format is in an interface
        //todo make a sensible timefn, or include as key when posting
        await Axios.post(process.env.SIM + '/api/members/prosumers/', {
            body:[
                {
                    id: id, 
                    timefn: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], //temporary, fix later
                    totalCapacity: prosumer.totalCapacity,
                    totalProduction: prosumer.totalProduction,
                    currentCapacity: prosumer.currentCapacity(), 
                    status: prosumer.status
                }
            ]
        });
        //todo api post the new entry to simulation with consumption data, alternative is to simulate localy 
        res.json({message:" success!", data: data}); 

    }else{
        res.status(400).json({message:"Invalid format", format:format})
    }
});
app.post('/api/member/control', (req, res)=>{//todo fix
    const data = req.body;

    if(data.id){
        const procumer = procumers.get(data.id);
        if(procumer){   
            procumer.input_ratio = data.input_ratio;
            procumer.output_ratio = data.output_ratio;
            procumer.status = data.status;
            res.json({"input_ratio": procumer.input_ratio, "output_ratio": procumer.output_ratio});
        }else{
            res.status(400).json({messsage:"No such memeber!"});
        }
    }
    else 
        res.status(400).json({messsage:"Invalid format"});
        
  
});
app.get('/api/member/control/:id', (req, res)=>{
    const id = req.params.id;
    const procumer = procumers.get(id);

    res.json({"input_ratio": procumer.input_ratio, "output_ratio": procumer.output_ratio});
});

let PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});

async function fetchAll() {
    const data = await DB.Models.Prosumer.find({name: process.env.NAME}).exec();
    const publisher = [];
    data.forEach(entry => {
        const bc = [];
        const tc = [];
        entry.batteries.forEach(b=> bc.push(new Battery(b.capacity,b.maxOutput, b.maxCharge, b.current)));
        entry.turbines.forEach(t=>tc.push(new Turbine(t.maxPower)));
        const prosumer = new Procumer(bc,tc, entry.id);
        procumers.set(entry.id, prosumer);
        prosumer.status =  true;
        publisher.push( {
            id: entry.id, 
            timefn: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], //temporary, fix later
            totalCapacity: prosumer.totalCapacity,
            totalProduction: prosumer.totalProduction,
            currentCapacity: prosumer.currentCapacity(), 
            status: prosumer.status
        });
        
    });
    await Axios.post(process.env.SIM + '/api/members/prosumers/', 
    {
      body: publisher  
    }   
   );

    // console.log(data);
}