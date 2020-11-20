import express = require("express");
import { Procumer } from "./procumer";
import uuid = require("uuid");


let id = process.env.ID || uuid.v4();
let input_ratio = 0.8;
let out_ration = 1;



const procumers: Map<String, Procumer> = new Map<String, Procumer>();
//fetch from database, id and procumers
const app: express.Application = express();

app.use(express.json());

let logger = (req, res, next) =>{
    console.log('${req.protocol}://${req.get("host")}${req.originalUrl}: got request')
    next();
}; 
app.use(express.json());


app.get('/api/member/:id', (req,res)=>{
    const data = procumers.get(req.params.id);
    if(data){
        data.tick();
        res.json(data);
    }
    else
        res.status(400).json({messsage:"No such id"});
});
app.get('/api/members', (req,res)=>{
    const data = Array.from(procumers.values());
    if(data)
        res.json(data);
    else
        res.status(400).json({messsage:"No memebers!"});
});
//api add procumer
app.post('/api/member/add/procumer');

let PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log("App is listening on port ${PORT}");
});