
import express = require("express");
import { Cell, Stats } from "./cell";
import { DB } from "../DB-Connector/db-connector"; //todo
import { Types } from "mongoose";


const app = express();
const cells = new Map<String, Cell>();
const id = process.env.ID || Types.ObjectId().toHexString();
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
    const format = ["dest"]//enforced members
    const data= req.body;
    if(Object.keys(data).filter(k=>format.some(e => k === e)).length === format.length){
        const id  = data.id ? data.id : Types.ObjectId().toHexString();
        const cell =new Cell(data.dest);
        cells.set(id, cell);
        await document();
    }else
        res.status(400).json({message: "invalid format!", format:format});
});

app.get('/api/price',async (req, res)=>{
    const stats = await totalStats();//handle errors
    res.json(price(stats.totalProduction, stats.totalDemand));
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
async function fetchAll() {
    try {
        const data = await DB.Models.Market.findById(id);
        if(data){
            data.cells.forEach(d => cells.set(data.id, new Cell(d)));
        }
    } catch (error) {
        await document();
    }
}
async function document(){
        
    try {
    const cell_dest = Array.from(cells.values()).map(c => c.destination);
    const entry = await DB.Models.Market.findById(this.id).exec(); //todo fix this sly solution
    if(!entry){
        const body = {
            name: process.env.NAME,
            cells: cell_dest,
            _id: Types.ObjectId(+this.id)
        };
        await DB.Models.Market.create(body);
    }else{
        const body = {
            name: process.env.NAME,
            cells: cell_dest    
        }
        await DB.Models.Market.findByIdAndUpdate(this.id, body, {upsert : true});
    }
    } catch (error) {
        console.log(error);
    }
}