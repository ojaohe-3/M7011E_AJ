import express = require("express");
import { Manager } from "../manager";
import { Simulator } from "../simulation";

const app = express.Router();




app.get("/:id", (req, res) => {//todo fetch from producer source
    const sim = Simulator.singelton;

    const data =sim.managers.get(req.params.id);
    if(data)
        res.json(data);
    else
        res.status(404).json({message: `no such manager with id ${req.params.id}`})
    
});
app.get("/", (req, res) => {
    const sim = Simulator.singelton;

    const data = Array.from(sim.managers.values());
    
    res.json(data)
    
});


app.post("/",(req,res) =>{
    const sim = Simulator.singelton;
    const format = ["id","maxProduction","current","status"] //enforced members
    const data= req.body;

    data.body.forEach(item => {
        //look if all enforced key exists
        if(Object.keys(item).filter(k=>format.some(e => k === e)).length === format.length){
            
            sim.managers.set(item.id, data);
        }else
            res.status(400).json({message:"Invalid format", required: format});  
    });
    res.json({message: "memeber added!", data: data});

    
});

app.put("/:id",(req, res)=>{
    const data = req.body;
    const format = ["current","status"]
    const id = req.params.id;
    
    if(Object.keys(data).filter(k=>format.some(e => k === e)).length === format.length){
        if(Simulator.singelton.managers.has(id)){
            const entry = Simulator.singelton.managers.get(id);
            entry.current = data.current;
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
