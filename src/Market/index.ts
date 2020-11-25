
import express = require("express");

import uuid = require("uuid");
import { Cell } from "./cell";


const app = express();
const cells = new Map<String, Cell>();
const id = process.env.ID || uuid.v4();


app.get('/api/members/',(req, res)=>{
    res.json(Array.from(cells.values())); 
});
app.get('/api/member/:id',(req, res)=>{
    const id = req.params.id;
    if(id && cells.has(id))
        res.json(cells.get(id));
    else
        res.status(404).json({message: "No such id!"}); 
});

app.post('/api/member/', (req, res)=>{
    const format = ["id","name", "dest"]//enforced members
    const data= req.body;
    if(Object.keys(data).filter(k=>format.some(e => k === e)).length === format.length){
        //update database
        cells.set(data.id, new Cell(data.id, data.name, data.dest));
    }else
        res.status(400).json({message: "invalid format!", format:format});
});
let PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log("App is listening on port ${PORT}");
});