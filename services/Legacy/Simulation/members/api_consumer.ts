import Consumer, { TimeArray } from "../models/consumer";
import ConsumerHandler from "../handlers/ConsumerHandler";
import Authenticate from "../authentication/authenticator";
import { Router } from "express";

const app = Router();
const handler = ConsumerHandler.instance;

interface userFormat{
	id : string, 
	timefn : TimeArray, 
	demand? : number, 
	profile?: number
}

app.get("/", (_, res) => {
	res.json(handler.getConsumers());
});

app.get("/:id", (req, res) => {
	try {
		const id = req.params.id;
		res.json(handler.getConsumer(id));
	} catch (error) {
		res.status(404).json({
			message: "could not find member",
			error: error,
			status: 404
		})
	}
});

app.post("/", Authenticate("admin"),(req, res) => {
	try {
		const data = req.body as userFormat;
		handler.addConsumer(new Consumer(data.id, data.timefn, data.demand, data.profile));
	} catch (error) {
		
	}
});
 
export default app;
