import express = require("express");
import { Simulator } from "../simulation";

const app = express.Router();

class dataCollector{
    sim: Simulator;
    constructor(simulation: Simulator){
        this.sim = simulation;
    }
}

