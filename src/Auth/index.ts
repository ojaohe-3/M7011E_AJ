import express = require("express");
import { DB } from "./DB-Connector/db-connector";
import { UserSchema } from "./DB-Connector/user";
interface privilage{
	level: Number,
    access?: String,
    id: String
}
interface userdata {
	username: String,
    clientid: String,
    managers?: Array<privilage>,
    prosumers?: Array<privilage>,
    consumers?: Array<string>,
    last_login: Date,
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

app.get("/login/:name", async (req, res) => {
	const Cid = req.params.name;
	const entry = await DB.Models.User.find({"clientid": Cid});
	if(entry){
		res.json(entry);
	}else{
		res.status(401).send("no such user with id " + Cid);
	}
});

if(process.env.NODE_ENV == 'development'){
	app.post("/loggin/", async (req, res)=>{
		const data: userdata = req.body;
		await DB.Models.User.create(data);
		console.log(data);
	});
}

const PORT = +process.env.PORT | 5000;
app.listen(PORT, () => {
	console.log(`lisening on ${PORT}`);
});
