import { Router } from "express";
import DataMonitor from "../handlers/DataMonitor";

const app = Router();

//TODO
// get all datapoints from the simulation
// get from specific member datapoints
// querry for data

app.get("/:id", async (req, res)=>{
    const monitor = DataMonitor.instance;
    try {
        await monitor.get(req.params.id!)
    } catch (error) {
        console.log(error);
        res.status(400).json({message:"could not evaluate simulation data, maybe services is missing?", err: error});
    }
});

export default app;
