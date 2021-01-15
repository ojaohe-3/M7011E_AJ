

import express = require("express");
import { Manager } from "./Manager";
import { Types } from "mongoose";
import ManagerHandler from "./ManagerHandler";
import { DB } from "./DB-Connector/db-connector";

require('dotenv').config();


const app = express.Router();
app.get('/',(req, res)=>{
    res.json(ManagerHandler.Instance.getAll()); 
});


app.get('/:id/prosumers', async (req,res)=>{ //todo, this will be tied to the jwt, possibly might be removed
    const data = await DB.Models.Prosumer.find({name: "this.sim"}); //todo manager prosumer controller
    res.json(data);
});


app.get('/:id',async (req, res)=>{
    const id = req.params.id;
    console.log(id);
    if(id){
        const manager = ManagerHandler.Instance.getById(id);
        res.json(manager);
    }
    else
        res.status(404).json({message: "No such id!"}); 
});

app.post('/', async (req, res)=>{
    const data= req.body;
    try {
        const id = data.id ? data.id: Types.ObjectId().toHexString();
        const manager = new Manager(id, data.maxProduction);
        res.json({data: data, message: "success!"});
    } catch (error) {
        res.status(400).json({message: "API Error!", expected_format: "maxProduction"});
    }


        
    
});

module.exports = app;