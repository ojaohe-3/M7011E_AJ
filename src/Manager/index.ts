
import express = require("express");

import uuid = require("uuid");
import { Manager } from "./Manager";
import {DB} from "../DB-Connector/db-connector";
import { ManagerSchema } from "../DB-Connector/manager";
import { Types } from "mongoose";
require('dotenv').config();
const cors = require('cors');
const axios = require('axios');
const db = new DB({Manager: new ManagerSchema().model});
const app = express(); 
const managers = new Map<String, Manager>();


let logger = (req, res, next) =>{
    console.log(`at ${(new Date()).toString()}: ${req.protocol}://${req.get("host")}${req.originalUrl}: ${req.method} request`)
    next();
}; 
app.use(cors())
app.use(logger)
app.use(express.json());
app.get('/api/members/',(req, res)=>{
    res.json(Array.from(managers.values())); 
});
app.get('/api/member/:id',(req, res)=>{
    const id = req.params.id;
    if(id && managers.has(id))
        res.json(managers.get(id));
    else
        res.status(404).json({message: "No such id!"}); 
});

app.post('/api/member/', async (req, res)=>{
    const format = ["maxProduction"]//enforced members todo central funciton handle this perferable decorator
    const data= req.body;
    console.log(data);
    if(Object.keys(data).filter(k=>format.some(e => k === e)).length === format.length){
        const id = data.id ? data.id : Types.ObjectId().toHexString();
        const manager = new Manager(id,data.maxProduction);
        managers.set(id, manager);
        await manager.document();
        await axios.post(process.env.SIM +'/members/managers/', {
            id: id,
            max: manager.maxProduciton,
            current: manager.current,
            status: manager.status
        }).then(m => console.log(m)).catch(err => console.log(err));//todo make interface for data
    }else
        res.status(400).json({message: "invalid format!", format:format});
});
let PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});

async function fechAll(){
    try {
        const entry = await DB.Models.Manager.find({name: process.env.NAME}).exec();
        entry.forEach(m => 
            { 
                const man = new Manager(m.id, m.maxProduciton);
                man.current = m.current;
                man.ratio = m.ratio;
                if( m.status)
                    man.setActive();
                man.Produce(1.1);
                managers.set(m.id, man);
            }
    } catch (error) {
        
    }
}