import { assert } from "console";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
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
    type:string,
    main?: String,
    managers?: Array < Privilage >,
    prosumers?: Array < Privilage >,
    admin: boolean,
    last_login?: Date
}



const options = {
	algorithm: 'HS512',
	expiresIn: '4h'
}




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
const cors_options: cors.CorsOptions = {
    allowedHeaders: [
      'Origin',
      'X-Requested-With', 
      'Content-Type',
      'Accept',
      'X-Access-Token',
    ],
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: process.env.API_URL || 'localhost',
    preflightContinue: false,
  }
  
  app.use(cors(cors_options));
  
  
  app.use(express.urlencoded({
    extended: false
  }))
  
  

  
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.set('Content-Type', 'application/json')
    next()
  })
  

app.get("/api/validate",  async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    try {
        jwt.verify(token, process.env.JWT_SECRET)
        const data = jwt.decode(token)
        res.json({message: "Valid Token!", status: 1, body: data}) //todo enforce TLS 
    } catch (error) {
        res.json({message: "Invalid Token!", status: 0, reason: error.message})
        
    }

});


app.post("/api/login/", async (req, res) => {
    try {
        
        const data = req.body;
        // console.log(data);
        const entry: UserData = await DB.Models.User.findOne({username: data.username});
        // console.log(entry);
        if (entry) {
            if(saltedSha256(data.password, data.username) === entry.password)
            {
    
                entry.last_login = new Date();
                await DB.Models.User.findOneAndUpdate({username: data.username}, entry).exec();
    
                const display = {
                    username: entry.username,
                    main : entry.main,
                    managers: entry.managers,
                    prosumers: entry.prosumers,
                    admin: entry.admin,
                    last_login: entry.last_login
                }
    
                const token = jwt.sign({data: display},  process.env.JWT_SECRET, options);
                res.json({message: 'success!', jwt: token, user: display});
            } else {
                res.json({message: "invalid login credentials", reason: 'invalid password or username', status : 0});
            }
        } else {
        res.status(404).send("no such user with id " + data.id);
        }
        } catch (error) {
            console.log(error);
            res.status(500).json({message: 'error', error: error, status: 500});
    }
});


app.post("/api/register/", async (req, res) => {
    try {
		const data: Partial<UserData> = req.body;
        data.password = saltedSha256(data.password!, data.username!, false) //it might be a mistake to salt the password based on the username, but the options are very limited when this is deployed behind a loadbalancer. secret key could be fixed for the sake of brevity
        if(data.admin){
            throw new Error("Admin Privilage are not allowed to be set");
        }
        if(!data.main){
            data.type = "empty";
        }
        else{
            data.type!;
        }

        data.last_login = new Date();
        data.admin = false;
        console.log(data);
        await DB.Models.User.create(data);
        res.json({message: 'User created successfully!', jwt: 'token', user: data});
    } catch (error) {
        console.log(error);
        res.json({message: 'Failed to create user', reason: error});
    }
});

const PORT = + process.env.PORT | 5000;
app.listen(PORT, () => {
    console.log(`lisening on ${PORT}`);
});

DB.Instance;
function sign_jwt(user: UserData) {}//TODO figure out what the fuck i was smoking here
