import express = require("express");
import { Types } from "mongoose";
import { Consumer } from "../consumer";
import { Procumer } from "../procumer";
import { Simulator } from "../simulation";
import { Weather } from "../weather";

const app = express.Router();


app.get("/", (req, res)=>{
    const sim = Simulator.singelton;

    const temp = Array.from(sim.consumers.values());
    let data = temp.map(e => {
        e.demand = e.consumption(sim.weather.temp);
        return [e, sim.prosumers.get(e.id)];  
    })
    res.json(data);
});
//api get procumer
app.get("/:id", (req, res) => {
    const sim = Simulator.singelton;
    const data =sim.prosumers.get(req.params.id);
    if(data)
        res.json(data);
    else
        res.status(404).json({message: `no such produmer with id ${req.params.id}`})
    
});

app.post("/",(req,res) =>{
    const sim = Simulator.singelton;

    const format = ["id","timefn","totalProduction","currentCapacity", "status","totalCapacity"] //enforced members
    const data= req.body;
    data.body.forEach(item => {
        //look if all enforced key exists
        if(Object.keys(item).filter(k=>format.some(e => k === e))){
            if(item.timefn.length !== 24){
                res.status(400).json({message:"Invalid format for timefn", required: "24 length array of (mean, deviation)"});  
            }
            else{   
                const consumer = new Consumer(item.id, item.timefn);
                sim.consumers.set(item.id, consumer);
                sim.prosumers.set(item.id, {id: item.id, 
                    status: item.status,  
                    totalProduction: item.totalProduction, 
                    currentCapacity: item.currentCapacity,
                    totalCapacity: item.totalCapacity
                });
                consumer.document();
            }
        }else
            res.status(400).json({msg:"Invalid format", required: format});  
    });
    res.json({msg: "memeber added!", data: data});

});

app.put("/:id",(req,res) =>{
    const data = req.body;
    const format = ["currentCapacity","totalProduction","status"]
    const id = req.params.id;
    
    if(Object.keys(data).filter(k=>format.some(e => k === e)).length === format.length){
        if(Simulator.singelton.prosumers.has(id)){
            const entry = Simulator.singelton.prosumers.get(id);
            entry.currentCapacity = data.currentCapacity;
            entry.totalProduction = data.totalProduction;
            entry.status = data.status;
            res.json({message: "memeber updated!", data: data});

        }else{
            res.status(404).json({"message": "no such id!"})
        }
    }else{
        res.status(400).json({message:"Invalid format", required: format});  
    }

});
module.exports = app;