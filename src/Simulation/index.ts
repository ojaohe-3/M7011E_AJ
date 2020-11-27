
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
    console.log(`${req.protocol}://${req.get("host")}${req.originalUrl}: got request`)
    next();
}; 
const simulation = new Simulator({lat: 65.58415, lon: 22.15465});//todo fetch this from db. if new, push to db new default instance.
setInterval(simulation.tick, 1000);//update every second
//todo get simulation data from db
//todo make a checkout and cach requests
let temp = 270;
let speed = 0;

//api get consumer(s) by query parameters
app.get("/api/consumers", (req, res) => {
    console.log("get reqest")
    console.log(simulation.consumers.size);
    simulation.consumers.forEach(e=>e.demand = e.consumption(temp));
    res.json(Array.from(simulation.consumers.values()));
});

app.get("/api/consumer/:id", (req, res) => {

    simulation.consumers.forEach((v, k) => {
        if(k === req.params.id)
            res.json(v);
    });
    // res.status(400).json({msg: "no such consumer with id ${req.params.id}"})

    
});
//api get procumers
app.get("/api/procumers", (req, res)=>{//todo fetch from producer source
    let data: Array<Consumer> = [];
    simulation.consumers.forEach(v=> data.push(v));
    res.json(data);
});
//api get procumer
app.get("/api/procumer/:id", (req, res) => {//todo fetch from producer source

    simulation.prosumers.forEach((v, k) => {
        if(k === req.params.id )
            res.json(v);
    });
    // res.status(400).json({msg: "no such produmer with id ${req.params.id}"})
    
});
app.get("/api/manager/:id", (req, res) => {//todo fetch from producer source

    simulation.managers.forEach((v, k) => {
        if(k === req.params.id)
            res.json(v);
    });
    res.status(400).json({msg: "no such produmer with id ${req.params.id}"})
    
});
app.get("/api/managers", (req, res) => {//todo fetch from producer source
    const data = [];
    simulation.managers.forEach(v => data.push(v));
    res.json(data)
    // res.status(400).json({msg: "no such produmer with id ${req.params.id}"})
    
});

//api get get total production and total consumption todo with query
app.get("/api/stats", async (req, res)=>{
    try {
        const supply = simulation.getTotalSupply();
        const demand = simulation.getTotalDemand(temp);
        res.json({totalProduction: supply, totalDemand: demand});
    } catch (error) {
        console.log(error);
        res.status(400).json({message:"could not evaluate", err: error});
    }
});

//todo api
//todo post req add, consumer, manager and procumer
//api add consumer
app.post("/api/consumers",(req,res) =>{
    console.log("post request");
    const format = ["id","timefn"]; //enforced members
    const data= req.body;

    console.log(data);
    //look if all enforced key exists
    if(Object.keys(data).filter(k=>format.some(e => k === e)).length === format.length){
        if(data.timefn.length !== 24){
            res.status(400).json({message:"Invalid format for timefn", required: "24 length array of (mean, diviation)"});  
        }
        else{   
            const timefn = () => {
                const dt = data.timefn[(new Date()).getHours()];
                return Math.random()*dt[0]+Math.random()*dt[1]/2 - Math.random()*dt[1]/2 + (dt[0]-dt[1])^2/2;
            };
            simulation.consumers.set(data.id, new Consumer(data.id, timefn));
            //todo put in db
            res.json({message: "memeber added!", data: data});
        }
    }else
        res.status(400).json({message:"Invalid format", required: format});  
});


app.post("/api/managers",(req,res) =>{
    const format = ["id","max","current","status"] //enforced members
    const data= req.body;

    //look if all enforced key exists
    if(Object.keys(data).filter(k=>format.some(e => k === e)).length === format.length){
        simulation.consumers.set(data.id, new Consumer(data.id, data.timefn));
        //todo put in db
        res.json({msg: "memeber added!", data: data});
    }else
        res.status(400).json({msg:"Invalid format", required: format});  
});

app.post("/api/procumers",(req,res) =>{
    const format = ["id","timefn","production","capacity","current","dest", "status"] //enforced members
    const data= req.body;
    
    //look if all enforced key exists
    if(Object.keys(data).filter(k=>format.some(e => k === e))){
        if(data.timefn.length !== 24){
            res.status(400).json({message:"Invalid format for timefn", required: "24 length array of (mean, diviation)"});  
        }
        else{   
            const timefn = () : number => {
                const dt = data.timefn[(new Date()).getHours()];
                return Math.random()*dt[0]+Math.random()*dt[1]/2 - Math.random()*dt[1]/2 + (dt[0]-dt[1])^2/2; 
            };

            simulation.consumers.set(data.id, new Consumer(data.id, timefn));
            simulation.prosumers.set(data.id, new Procumer(data.id, data.production, data.capacity,data.current, data.status, data.dest));
            //todo put in db
            res.json({msg: "memeber added!", data: data});
        }
    }else
        res.status(400).json({msg:"Invalid format", required: format});  
});






const PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});


//todo fetch simulation data from managers
//todo fetch siumlation data from procumers

//todo publish change to database async
//todo async get weather module data and simulate tick.

//keep profiles updates

