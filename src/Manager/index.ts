import express = require("express");
import { DB } from "./DB-Connector/db-connector";
import { ManagerSchema } from "./DB-Connector/manager";
import { ProsumerSchema } from "./DB-Connector/prosumer";
require("dotenv").config();

const cors = require("cors");
const db = new DB({
	Manager: new ManagerSchema().model,
	Prosumer: new ProsumerSchema().model,
});
const app = express();

let logger = (req, res, next) => {
	console.log(
		`at ${new Date().toString()}: ${req.protocol}://${req.get("host")}${
			req.originalUrl
		}: ${req.method} request`
	);
	next();
};

app.use(cors());
app.use(logger);
app.use(express.json());

const control = require("./control");
const members = require("./members");

app.use("/api/control/", control);
app.use("/api/members/", members);

let PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
	console.log(`App is listening on port ${PORT}`);
});
