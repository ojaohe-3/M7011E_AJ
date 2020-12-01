import express = require("express");
import { Weather } from "../weather";
import { Simulator } from "../simulation";

const app = express.Router();


const sim = Simulator.singelton;
const weather = Weather.singleton;

//api get get total production and total consumption todo with query
app.get("/", async (req, res)=>{
    try {
        const supply = sim.getTotalSupply();
        const demand = sim.getTotalDemand(weather.temp);
        res.json({totalProduction: supply, totalDemand: demand});
    } catch (error) {
        console.log(error);
        res.status(400).json({message:"could not evaluate", err: error});
    }
});

module.exports = app;
