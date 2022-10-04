import { Router, Request, Response } from "express";
import Authenticate from "./authentication/authenticator";
import Monitor from "./monitor";

const app = Router();
app.get('/monitor', async (req: Request, res: Response) => {
    const monitor = Monitor.instant;
    res.json({
        traffic: monitor.traffic_graph,
        total_read_log: Math.log10(monitor.read_traffic + 1),
        total_write_log: Math.log10(monitor.write_traffic + 1),
        rate: monitor.rate_of_traffic
    });
})

export default app;