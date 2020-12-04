import express = require("express");
import { Procumer } from "./procumer";
import uuid = require("uuid");
import { Weather, Position } from "./weather";
import { Battery } from "./Battery";
import { Turbine } from "./Turbine";
import * as dotenv from "dotenv";
dotenv.config({path: "./.env"}); 

const sim_dest = process.env.SIM;
const current_service = process.env.DEST;  
const pos = {lat: +process.env.LAT, lon: +process.env.LON}
console.log(pos);
console.log(sim_dest);
console.log(current_service);
const weather = new Weather(pos); 
let id = process.env.ID || uuid.v4();




const procumers: Map<String, Procumer> = new Map<String, Procumer>();
//fetch from database, id and procumers
const app: express.Application = express();

app.use(express.json());

let logger = (req, res, next) =>{ 
    console.log(`${req.protocol}://${req.get("host")}${req.originalUrl}: got request`)
    next();
}; 
app.use(logger);
app.use(express.json());


app.get('/api/member/:id', (req,res)=>{
    const data = procumers.get(req.params.id);
    if(data){
        data.tick(weather.speed);
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
        res.status(400).json({messsage:"No memebers!"});
});
//api add procumer
app.post('/api/member/', (req, res)=>{
    const format = ["id","turbines", "batteries"] //enforced members
    const data= req.body;
    if(Object.keys(data).filter(k=>format.some(e => k === e)).length === format.length){
        const b = data.batteries;
        const t = data.turbines;
        let bc:Array<Battery> = [];
        let tc:Array<Turbine> = [];
        //unsafe but must be done we assume it is completed if the key exist
        b.forEach(e => bc.push(new Battery(e.capacity, e.maxOutput, e.maxCharge)));
        t.forEach(e => tc.push(new Turbine(e.maxPower)));
        procumers.set(data.id, new Procumer(bc,tc));
        //todo add to db and update simulation
        //todo api post the new entry to simulation
        res.json({message:" success!", data: data});

    }else{
        res.status(400).json({message:"Invalid format", format:format})
    }
});
app.post('/api/member/control', (req, res)=>{
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