import { Router, Request, Response } from "express";
import DataMonitor from "../handlers/DataMonitor";
import { IComponent } from "../models/node";

const app = Router();

//TODO
// get all datapoints from the simulation
// get from specific member datapoints
// querry for data
const monitor = DataMonitor.instance;
type Field = keyof IComponent;
app.get("/:id", async (req: Request, res: Response) => {
    try {
        const data = await monitor.get(req.params.id!)
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "could not evaluate simulation data, maybe services is missing?", err: error });
    }
});

app.get("/:id/:field", async (req: Request, res: Response) => {
    try {
        const field: Field = req.params.field as Field;
        const raw = await monitor.get(req.params.id!)
        if(raw){
            const data = raw.map(v => v[field]);
            res.json(data);

        }else{
            res.status(404).send("not found")
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "could not evaluate simulation data, maybe services is missing?", err: error });
    }
});
export default app;
