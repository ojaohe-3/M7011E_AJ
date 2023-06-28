import * as dotenv from "dotenv";
import ProsumerHandler from "../handlers/ProsumerHandler";
import Authenticate from "../authentication/authenticator";
import { Router } from "express";

dotenv.config({ path: "./.env" });

const app = Router();

app.get('/:id', Authenticate("prosumers", 3), async (req, res) => {
    try {

        const id = req.params.id;
        const procumer = ProsumerHandler.Instance.getById(id)!;
        res.json({ "input_ratio": procumer.input_ratio, "output_ratio": procumer.output_ratio, "status": procumer.status });
    } catch (error) {
        res.status(404).json({
            message: "failed to find member",
            error: error,
            status: 404
        })
    }
});

app.put('/:id', Authenticate("prosumers", 5), (req, res) => {
    interface format {
        input_ratio: number,
        output_ratio: number,
        status: boolean,
    }
    try {
        const data: format = req.body;
        const id = req.params.id;
        const procumer = ProsumerHandler.Instance.getById(id);
        if (procumer) {
            procumer.input_ratio = data.input_ratio;
            procumer.output_ratio = data.output_ratio;
            procumer.status = data.status;
            res.json({ "input_ratio": procumer.input_ratio, "output_ratio": procumer.output_ratio });
        } else {
            res.status(404).json({ messsage: "No such memeber! with " + id });
        }
    } catch (error) {
        res.status(400).json({ message: "API error", expected_format: "{input_ratio: number, output_ratio: number, status: boolean}" });
    }
});
app.get('/:id/disable', Authenticate("prosumers", 3), (req, res) => {
    try {
        const id = req.params.id;
        const procumer = ProsumerHandler.Instance.getById(id)!;
        procumer.status = false;
    } catch (error) {
        res.status(404).json({
            message: "failed to find member",
            error: error,
            status: 404
        })
    }
});
export default app;