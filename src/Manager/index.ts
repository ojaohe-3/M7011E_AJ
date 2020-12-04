
import express = require("express");

import uuid = require("uuid");
import { Manager } from "./Manager";


const app = express(); 
const managers = new Map<String, Manager>();
const id = process.env.ID || uuid.v4();
 

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

app.post('/api/member/', (req, res)=>{
    const format = ["id","maxProduction"]//enforced members
    const data= req.body;
    if(Object.keys(data).filter(k=>format.some(e => k === e)).length === format.length){
        //update database
        managers.set(data.id, new Manager(data.id,data.maxProduction));
    }else
        res.status(400).json({message: "invalid format!", format:format});
});
let PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});

