

import express = require("express");
import { Types } from "mongoose";
import Authenticate from "../authentication/authenticator";
import { DB } from "../DB-Connector/db-connector";
import ManagerHandler from "../handlers/ManagerHandler";
import Manager from "../models/manager";

require('dotenv').config();


const app = express.Router();
app.get('/',(req, res)=>{
    res.json( {body: ManagerHandler.Instance.getAll()}); 
});


app.get('/:id/prosumers', async (req,res)=>{ //todo, this will be tied to the jwt, this is very temporary
    // TODO
    // res.json(data);
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

app.post('/', Authenticate("admin"), async (req, res)=>{
    const data = req.body;
    try {
        const id = data.id ? data.id: Types.ObjectId().toHexString();
        const manager = new Manager(id, data.maxProduction);
        ManagerHandler.Instance.put(id, manager);
        res.json({data: data, message: "success!"});
    } catch (error) {
        res.status(400).json({message: "API Error!", expected_format: "maxProduction"});
    }


        
    
});

module.exports = app;