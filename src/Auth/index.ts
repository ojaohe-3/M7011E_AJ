import express = require("express");
import { DB } from "./DB-Connector/db-connector";
import { Types } from "mongoose";
import { UserSchema } from "./DB-Connector/loggin";

interface userdata {
	email: String;
	username: String;
	password: String;
	last_login: Date;
}

new DB({ User: new UserSchema().model });

let logger = (req, res, next) => {
	console.log(
		`at ${new Date().toString()}: ${req.protocol}://${req.get("host")}${
			req.originalUrl
		}: ${req.method} request`
	);
	next();
};
const app = express();
app.use(logger);
app.use(express.json());

app.post("/loggin/:name", async (req, res) => {
    
});

const PORT = +process.env.PORT | 5000;
app.listen(PORT, () => {
	console.log(`lisening on ${PORT}`);
});
