import express = require("express");
import { Consumer } from "../consumer";
import { Procumer } from "../procumer";
import { Simulator } from "../simulation";
import { Weather } from "../weather";

const app = express.Router();


const sim = Simulator.singelton;
const weather = Weather.singleton;
app.get("/", (req, res)=>{//todo fetch from producer source
    const temp = Array.from(sim.consumers.values());
    let data = temp.map(e => {
        e.demand = e.consumption(weather.temp);
        return [e, sim.prosumers.get(e.id)];  
    })
    res.json(data);
});
//api get procumer
app.get("/:id", (req, res) => {//todo fetch from producer source
    const data =sim.prosumers.get(req.params.id);
    if(data)
        res.json(data);
    else
        res.status(404).json({message: `no such produmer with id ${req.params.id}`})
    
});

app.post("/",(req,res) =>{
    const format = ["id","timefn","production","capacity","current","name", "status"] //enforced members
    const data= req.body;
    data.body.forEach(item => {
        //look if all enforced key exists
        if(Object.keys(item).filter(k=>format.some(e => k === e))){
            if(item.timefn.length !== 24){
                res.status(400).json({message:"Invalid format for timefn", required: "24 length array of (mean, deviation)"});  
            }
            else{   
                const timefn = () : number => {
                    const dt = item.timefn[(new Date()).getHours()];
                    return Math.random()*dt[0]+Math.random()*dt[1]/2 - Math.random()*dt[1]/2 + (dt[0]-dt[1])^2/2; 
                };

                sim.consumers.set(item.id, new Consumer(item.id, timefn));
                sim.prosumers.set(item.id, new Procumer(item.id, item.production, item.capacity,item.current, item.status, item.name));
                //todo put in db
            }
        }else
            res.status(400).json({msg:"Invalid format", required: format});  
    });
    res.json({msg: "memeber added!", data: data});

});


module.exports = app;