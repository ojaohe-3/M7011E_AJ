import express = require("express");
import { Simulator } from "../handlers/Simulation";

const app = express.Router();

//TODO
// get all datapoints from the simulation
// get from specific member datapoints
// querry for data

app.get("/", (req, res)=>{
    const sim = Simulator.instance;
    try {

    } catch (error) {
        console.log(error);
        res.status(400).json({message:"could not evaluate simulation data, maybe services is missing?", err: error});
    }
});

export default app;
