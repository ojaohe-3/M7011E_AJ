import express = require("express");
import { Weather } from "../weather";
import { Simulator } from "../simulation";
import { Consumer } from "../consumer";

const app = express.Router();

const con = require("./../../DB-Connector/consumer");
const sim = Simulator.singelton;
const weather = Weather.singleton

app.get("/", (req, res) => {
    sim.consumers.forEach(e=>e.demand = e.consumption(weather.temp));
    const data = Array.from(sim.consumers.values());
    res.json(data);
});

app.get("/:id", (req, res) => {
    const data = sim.consumers.get(req.params.id);
    if(data)
        res.json(data);
    else
        res.status(404).json({message: `no such consumer with id ${req.params.id}`})

});

app.post("/",(req,res) =>{
    const format = ["id","timefn"]; //enforced members

    const data= req.body;
    //look if all enforced key exists
    data.body.forEach(item => {
        if(Object.keys(item).filter(k=>format.some(e => k === e)).length === format.length){
            if(item.timefn.length !== 24){
                res.status(400).json({message:"Invalid format for timefn", required: "24 length array of (mean, diviation)"});  
            }
            else{   
                const timefn = () => {
                    const dt = item.timefn[(new Date()).getHours()];
                    return Math.random()*dt[0]+Math.random()*dt[1]/2 - Math.random()*dt[1]/2 + (dt[0]-dt[1])^2/2;
                };
                const consumer = new Consumer(item.id, timefn);
                sim.consumers.set(item.id, consumer);
                
            }
        }else
            res.status(400).json({message:"Invalid format", required: format});  
    });
    
    res.json({message: "memebers added!", data: data});

});

module.exports = app;
