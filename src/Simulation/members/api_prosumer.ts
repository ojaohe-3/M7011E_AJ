import express = require("express");
import  Battery  from "../models/battery";
import * as dotenv from "dotenv";
import { Types } from "mongoose";
import Turbine from "../models/Turbine";
import ProsumerHandler from "../handlers/ProsumerHandler";
import { Procumer } from "../models/procumer";
dotenv.config({ path: "./.env" });

const app = express.Router();

interface batteries {
	capacity: number;
	maxOutput: number;
	maxCharge: number;
	current?: number;
}
interface format {
	turbines: [number];
	batteries: [batteries];
	_id?: String;
}

function getObjectsFromJson(data: format) {
	const bs = [];
	const ts = [];
	data.batteries.forEach((b) =>
		bs.push(new Battery(b.capacity, b.maxOutput, b.maxCharge, b.current))
	);
	data.turbines.forEach((t) => ts.push(new Turbine(t)));
	return { batteries: bs, turbines: ts };
}

app.get("/", (req, res) => {
	const data = Array.from(ProsumerHandler.Instance.getAll().values());
	if (data) res.json(data);
	else res.status(400).json({ messsage: "No memebers!" });
});
app.post("/", async (req, res) => {

	try {
		const data: format = req.body;
		const obj = getObjectsFromJson(data);

		if (data._id) {
			await ProsumerHandler.Instance.put(
				data._id,
				new Procumer(obj.batteries, obj.turbines, data._id)
			);
		} else {
			const id = Types.ObjectId().toHexString();
			const prosumer = new Procumer(obj.batteries, obj.turbines, id);
			await ProsumerHandler.Instance.put(id, prosumer);
		}
		//todo api post the new entry to simulation with consumption data, alternative is to simulate localy
		res.json({ message: " success!", data: data });
	} catch (error) {
		console.log(error);
		res.status(400).json({
			message: " failed!",
			exptected_format: [
				"batteries: [{capacity: number, maxOutput: number, maxCharge: number, current?: number}]",
				"turbines[maxPower : number]",
			],
		});
	}
});

app.get("/:id", async (req, res) => {
	const data = ProsumerHandler.Instance.getById(req.params.id);
	if (data) {
		res.json(data);
	} else res.status(400).json({ messsage: "No such id" });
});

app.put("/:id", async (req, res) => {
	const prosumer = ProsumerHandler.Instance.getById(req.params.id);
	try {
		const data: format = req.body;
		if (data) {
			const obj = getObjectsFromJson(data);

			prosumer.batteries = obj.batteries;
			prosumer.turbines = obj.turbines;

			res.json({ message: "success!", data: data });
		} else res.status(400).json({ messsage: "No such id" });
	} catch (error) {
		res.status(400).json({
			message: " failed!",
			exptected_format: [
				"batteries: [{capacity: number, maxOutput: number, maxCharge: number, current?: number}]",
				"turbines[maxPower : number]",
			],
		});
	}
});

module.exports = app;
