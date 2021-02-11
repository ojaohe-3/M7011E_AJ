import express = require("express");
import {DB} from "./DB-Connector/db-connector";
import {UserSchema} from "./DB-Connector/user";
require('dotenv').config();

const jwt = require('jsonwebtoken');
const saltedSha256 = require('salted-sha256');

//todo clean this file up
//todo add TLS, functionallity to only allow certine endpoints if valid certification exist, such as an X509 certification of each service, and that enforced "discovery" and certification can be done in good order.
declare interface Privilage {
    level: Number,
    access?: String,
    id: String
}
declare interface UserData {
    username: String,
    password: String,
    main: String,
    managers?: Array < Privilage >,
    prosumers?: Array < Privilage >,
    consumers?: Array < string >,
    last_login?: Date
}



const options = {
	algorithm: 'HS384',
	expiresIn: '4h'
}

new DB({User: new UserSchema().model});



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
app.use(logger);
app.use(express.json());


app.post("/api/validate",  async (req, res) => {
    const payload = req.body;
    try {
        jwt.verify(payload.token, process.env.JWT_SECRET)
        const data = jwt.decode(payload.token)
        console.log(data);
        res.json({message: "Valid Token!", status: 1, data: data}) //todo enforce TLS 
    } catch (error) {
        res.json({message: "Invalid Token!"})
        
    }

});


app.post("/api/login/", async (req, res) => {
    const data = req.body;
    const entry: UserData = await DB.Models.User.findOne({username: data.username});

    if (entry) {
		if(saltedSha256(data.password, data.username) === entry.password)
		{

			entry.last_login = new Date();
			await DB.Models.User.findOneAndUpdate({username: data.username}, entry).exec();

			const display = { //custom solution using hooks on the type is really janky and unreliable. i went with KISS
                username: entry.username,
                main : entry.main,
                managers: entry.managers,
                prosumers: entry.prosumers,
                consumers: entry.consumers,
                last_login: entry.last_login
            }

            console.log(display)
        	const token = jwt.sign({data: display},  process.env.JWT_SECRET, options);
			res.json({message: 'success!', jwt: token, status: 1});
		} else {
			res.json({message: "invalid login credentials", reason: 'invalid password or username', status : 0});
		}
	} else {
	res.status(404).send("no such user with id " + data.id);
    }
});


app.post("/api/register/", async (req, res) => {
    try {
		const data: UserData = req.body;
        data.password = saltedSha256(data.password, data.username, false) //it might be a mistake to salt the password based on the username, but the options are very limited when this is deployed behind a loadbalancer. secret key could be fixed for the sake of brevity
        data.last_login = new Date();
        await DB.Models.User.create(data);
        res.json({message: 'User created successfully!', jwt: 'token'});
    } catch (error) {
        console.log(error);
        res.json({message: 'Failed to create user', reason: error});
    }
});

const PORT = + process.env.PORT | 5000;
app.listen(PORT, () => {
    console.log(`lisening on ${PORT}`);
});


function sign_jwt(user: UserData) {}
