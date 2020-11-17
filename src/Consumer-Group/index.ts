
import express = require("express");
import { Consumer } from "./consumer";
import { Battery, Procumer, Turbine } from "./Procumer";

const app: express.Application = express();


const consumers = new Map<String, Consumer>();
let temp: number = 0; //todo fetch data and store here
//todo get simulation data from db
//temp
let t1 = new Consumer("1",(time) => {
    return 1;
});
let t2 = new Consumer("2",(time) => {
    return 1;
});
let t3 = new Consumer("3",(time) => {
    return 1;
});
let t4 = new Consumer("4",(time) => {
    return 1;
});
let t5 = new Procumer("5", (time) => {return 1;}, [new Turbine(1300)], [new Battery(4000,100,100)]);
consumers.set(t1.id,t1);
consumers.set(t2.id,t2);
consumers.set(t3.id,t3);
consumers.set(t4.id,t4);
consumers.set(t5.id,t5);
//todo make a checkout and cach requests


//todo api get consumer(s) by query parameters
app.get("/api/consumers", (req, res) => {
    let id = req.query.id? req.query.id: "";
    let data: Array<Consumer> = [];
    consumers.forEach((v, k) => {
        if(k.includes(id.toString()))
            data.push(v);
    });
    res.json(data);
});

app.get("/api/consumers/:id", (req, res) => {
    let data: Array<Consumer> = [];
    consumers.forEach((v, k) => {
        if(k.includes(req.params.id))
            data.push(v);
    });
    res.json(data);
});
//todo api get procumers
app.get("/api/procumers", (req, res)=>{
    let id = req.query.id? req.query.id: "";
    let data: Array<Consumer> = [];
    consumers.forEach((v, k) => {
        if(k.includes(id.toString()) && v.constructor.name === "Procumer")
            data.push(v);
    });
    res.json(data);
});
//todo api get procumer
//todo api get get total production and total consumption with query

app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.listen(5000, function () {
    console.log("App is listening on port 5000!");
});

//todo publish change to database async
//todo async get weather module data and simulate tick.


function getTotalConsumption() : number{
    let acc = 0;
    consumers.forEach((v) => acc += v.consumption(temp));
    return acc;
}

function getTotalProduction() : number{
    let acc = 0;
    consumers.forEach((v) => {
        if( v.constructor.name == "Procumer"){  
            acc += (v as Procumer).totalProduction;
        }
    });
    return acc;
}