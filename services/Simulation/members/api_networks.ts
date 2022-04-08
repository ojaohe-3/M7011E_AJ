import { Router } from "express";
import NetworkHandler from "../handlers/NetworkHandler";
import Network from "../models/network";

const net = NetworkHandler.instance;
const app = Router();

app.get('/', async (_, res) => {
    res.json(net.getAll());
})

export default app;