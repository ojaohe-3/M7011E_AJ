import express = require("express");
import { Manager } from "../manager";
import { Simulator } from "../simulation";

const app = express.Router();


const sim = Simulator.singelton;


app.get("/:id", (req, res) => {//todo fetch from producer source

    const data =sim.managers.get(req.params.id);
    if(data)
        res.json(data);
    else
        res.status(404).json({message: `no such manager with id ${req.params.id}`})
    
});
app.get("/", (req, res) => {
    const data = Array.from(sim.managers.values());
    
    res.json(data)
    
});


app.post("/",(req,res) =>{
    const format = ["id","max","current","dest","status"] //enforced members
    const data= JSON.parse(req.body);

    data.body.array.forEach(item => {
        //look if all enforced key exists
        if(Object.keys(item).filter(k=>format.some(e => k === e)).length === format.length){
            sim.managers.set(item.id, new Manager(item.id, item.current, item.max, item.dest, item.status));
            //todo put in db
        }else
            res.status(400).json({msg:"Invalid format", required: format});  
    });
    res.json({msg: "memeber added!", data: data});

    
});

module.exports = app;
