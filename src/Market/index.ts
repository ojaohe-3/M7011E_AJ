import express = require("express");
import {Cell, Stats} from "./cell";
import {DB} from "./DB-Connector/db-connector";
import {Types} from "mongoose";


// todo refactor this entire service

let logger = (req, res, next) => {
    console.log(`at ${
        new Date().toString()
    }: ${
        req.protocol
    }://${
        req.get("host")
    }${
        req.originalUrl
    }: ${
        req.method
    } request`);
    next();
};
const app = express();
const cells = new Map<String, Cell>();
const id = process.env.ID || Types.ObjectId().toHexString();

const price = (supply, demand) => {
    return(0.0001 * (demand - supply)) / 2;

};
const tick = async () => { // this is serious need of caching
    const stat = await totalStats();
    price(stat.totalProduction, stat.totalDemand);
};
setInterval(tick, 60000); // update every minute
fetchAll();

app.use(express.json());
app.use(logger);
app.get("/api/members/", (req, res) => {
    res.json(Array.from(cells.values()));
});
app.get("/api/member/:id", (req, res) => {
    const id = req.params.id;
    if (id && cells.has(id)) 
            res.json(cells.get(id));
            else 
                res.status(404).json({message: "No such id!"});
            }
        );

app.post("/api/member/", async (req, res) => {
	const format = ["destination"]; // todo fix this 
	const data = req.body;
	if (Object.keys(data).filter((k) => format.some((e) => k === e)).length === format.length) {
		const id = data.id ? data.id : Types.ObjectId().toHexString();
		const cell = new Cell(data.destination);
		cells.set(id, cell);
		await document();
	} else 
		res.status(400).json({message: "invalid format!", format: format});
	}
);

app.get("/api/price", async (req, res) => {
	const stats = await totalStats(); // handle errors when i care lol
	res.json({
		price: price(stats.totalProduction, stats.totalDemand),
		stats: stats
	});
});

let PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
	console.log(`App is listening on port ${PORT}`);
});

async function totalStats(): Promise < Stats > {
	const data = Array.from(cells.values());
	let acc: Stats = {
		totalDemand: 0,
		totalProduction: 0
	};
	await Promise.all(data.map(async (c) => {
		const body = await c.getStats();
		acc.totalDemand += body.totalDemand;
		acc.totalProduction += body.totalProduction;
	}));
	return acc;
}
async function fetchAll() {
	try {
		const data = await DB.Models.Market.findById(id);
		if (data) {
			data.cells.forEach((d) => cells.set(data.id, new Cell(d)));
		}
	} catch (error) {
		await document();
	}
}
async function document() {
	try {
		const cell_dest = Array.from(cells.values()).map((c) => c.destination);
		const entry = await DB.Models.Market.findById(this.id).exec(); // todo fix this sly solution ... this is awful how could you?
 		if (! entry) {
			const body = {
				name: process.env.NAME,
				cells: cell_dest,
				_id: Types.ObjectId(+ this.id)
			};
			await DB.Models.Market.create(body);
		} else {
			const body = {
				name: process.env.NAME,
				cells: cell_dest
			};
			await DB.Models.Market.findByIdAndUpdate(this.id, body, {upsert: true}); // YOU EVEN FIXED IT NO NEED FOR THIS CRUDE SOLUTION WHY????
		}
	} catch (error) {
		console.log(error);
	}
}
