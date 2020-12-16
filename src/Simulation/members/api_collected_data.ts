import express = require("express");
import { Simulator } from "../simulation";

const app = express.Router();



//api get get total production and total consumption todo with query
app.get("/", async (req, res)=>{
const sim = Simulator.singelton;

    try {
        await sim.tick();
        const supply = sim.getTotalSupply();
        const demand = sim.getTotalDemand();
        res.json({totalProduction: supply, totalDemand: demand});
    } catch (error) {
        console.log(error);
        res.status(400).json({message:"could not evaluate simulation data, maybe services is missing?", err: error});
    }
});

// app.get("/service", async (req, res)=>{
//     try {
//         await sim.tick();
//         const supply = sim.getTotalSupply();
//         const demand = sim.getTotalDemand();
//         res.json({totalProduction: supply, totalDemand: demand});
//     } catch (error) {
//         console.log(error);
//         res.status(400).json({message:"could not evaluate simulation data, maybe services is missing?", err: error});
//     }
// });

module.exports = app;
