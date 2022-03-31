import * as dotenv from "dotenv";
import ProsumerHandler from "../handlers/ProsumerHandler";
import { Procumer , IProcumer} from "../models/procumer";
import Authenticate from '../authentication/authenticator';
import Battery from '../models/battery';
import Turbine from '../models/turbine';
import { Router } from "express";
dotenv.config({ path: "./.env" });

const app = Router();
const handler = ProsumerHandler.Instance;

app.get("/", (req, res) => {
	res.json(handler.getAll())
});
app.post("/", Authenticate("admin"), async (req, res) => {

	try {
		const body = req.body as Partial<IProcumer>
		const batteries = body.batteries!.map(v => new Battery(v.capacity, v.maxOutput, v.maxCharge, v.current));
		const turbines = body.turbines!.map(v => new Turbine(v.maxPower));
		handler.set(new Procumer(batteries, turbines, body.id));
		res.json({
			message: "sucess!",
			status: 200,
			data: body
		})
	} catch (error) {
		console.log(error);
		res.status(400).json({
			message: " failed!",
			status: 400,
			error: error
		});
	}
});

app.get("/:id", async (req, res) => {
	const data = handler.getById(req.params.id);
	if (data) {
		res.json(data);
	} else res.status(404).json({ messsage: "No such id" });
});

app.put("/:id", Authenticate("prosumers", 5),async (req, res) => {
	try {	
		const id = req.params.id;
		const data = req.body as Partial<IProcumer>;
		const member = handler.getById(id)!;

		const batteries : Battery[] | undefined = data.batteries?.map(e => new Battery(e.capacity, e.maxOutput, e.maxCharge, e.current));
		const turbines : Turbine[] | undefined = data.turbines?.map(e=> new Turbine(e.maxPower));
		member.batteries = batteries ? batteries : member.batteries;
		member.turbines = turbines ? turbines : member.turbines;
		res.json({
			message: "sucess!",
			status: 200,
			data: data
		})
	} catch (error) {
		res.status(400).json({
			message: " failed!",
			status: 400,
			error: error
		});
	}
});

export default app;
