import express = require("express");
import { Weather } from "../weather";
import { Simulator } from "../simulation";
import { Consumer } from "../consumer";

const app = express.Router();


const sim = Simulator.singelton;
const weather = Weather.singleton

app.get("/", (req, res) => {
    sim.consumers.forEach(e=>e.demand = e.consumption(weather.temp));
    res.json(Array.from(sim.consumers.values()));
});

app.get("/:id", (req, res) => {
    const data = sim.consumers.get(req.params.id);
    if(data)
        res.json(data);
    else
        res.status(404).json({message: `no such consumer with id ${req.params.id}`})

});

app.post("/",(req,res) =>{
    console.log("post request");
    const format = ["id","timefn"]; //enforced members
    const data= JSON.parse(req.body);

    console.log(data);
    //look if all enforced key exists
    data.body.array.forEach(item => {      
        if(Object.keys(item).filter(k=>format.some(e => k === e)).length === format.length){
            if(item.timefn.length !== 24){
                res.status(400).json({message:"Invalid format for timefn", required: "24 length array of (mean, diviation)"});  
            }
            else{   
                const timefn = () => {
                    const dt = item.timefn[(new Date()).getHours()];
                    return Math.random()*dt[0]+Math.random()*dt[1]/2 - Math.random()*dt[1]/2 + (dt[0]-dt[1])^2/2;
                };
                sim.consumers.set(data.id, new Consumer(item.id, timefn));
                //todo put in db
            }
        }else
            res.status(400).json({message:"Invalid format", required: format});  
    });
    
    res.json({message: "memebers added!", data: data});

});

module.exports = app;
