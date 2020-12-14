
import express = require("express");

import uuid = require("uuid");
import { Procumer } from "../Simulation/procumer";
import { Consumer } from "../Simulation/consumer";
import { Cell, Stats } from "./cell";
import { DB } from "../DB-Connector/db-connector";


const app = express();
const cells = new Map<String, Cell>();
const id = process.env.ID || uuid.v4();
let price = (supply, demand)=>{
    return 0.0001*(demand-supply)/2+0.15;
};


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

app.post('/api/member/', async (req, res)=>{
    const format = ["id","name", "dest"]//enforced members
    const data= req.body;
    if(Object.keys(data).filter(k=>format.some(e => k === e)).length === format.length){
        const cell =new Cell(data.id, data.dest);
        cells.set(data.id,cell );
        await cell.document();
    }else
        res.status(400).json({message: "invalid format!", format:format});
});

app.get('/api/price',async (req, res)=>{
    const stats = await totalStats();//handle errors
    res.json(stats);
});

let PORT =  process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});


async function totalStats() : Promise<Stats>{
    const data = Array.from(cells.values());
    let acc: Stats;
    await Promise.all(data.map(async c => {
        const body = await c.getStats();
        acc.totalDemand += body.totalDemand;
        acc.totalProduction += body.totalProduction;
    }));
    return acc;
}