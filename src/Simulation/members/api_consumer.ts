import express = require("express");
import { Simulator } from "../handlers/simulation";
import { Consumer } from "../models/consumer";
import { Types } from "mongoose";
import { Weather } from "../weather";
const app = express.Router();

app.get("/", (req, res) => {
	const sim = Simulator.singelton;
	sim.consumers.forEach((e) => (e.demand = e.consumption(sim.weather.temp)));
	const data = Array.from(sim.consumers.values());
	res.json(data);
});

app.get("/:id", (req, res) => {
	const sim = Simulator.singelton;

	const data = sim.consumers.get(req.params.id);
	if (data) res.json(data);
	else
		res.status(404).json({
			message: `no such consumer with id ${req.params.id}`,
		});
});

app.post("/",(req, res) => {
	const format = [ "timefn"]; //enforced members
	const sim = Simulator.singelton;

	const data = req.body;
	//look if all enforced key exists
	data.body.forEach(async (item) => {
		if (
			Object.keys(item).filter((k) => format.some((e) => k === e))
				.length === format.length
		) {
			if (item.timefn.length !== 24) {
				res.status(400).json({
					message: "Invalid format for timefn",
					required: "24 length array of numbers",
				});
				
			} else {
				
				const id = item.id ? item.id : Types.ObjectId().toHexString();
				const consumer = new Consumer(id, item.timefn);
				consumer.demand = consumer.consumption(Weather.getInstance().temp);
				sim.consumers.set(id, consumer);
				await consumer.document();
			}
		} else
			res.status(400).json({
				message: "Invalid format",
				required: format,
			});
	});

	res.json({ message: "memebers added!", data: data });
});
 
module.exports = app;
