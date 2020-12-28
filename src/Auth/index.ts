
import express = require("express");
import { DB } from "./DB-Connector/db-connector";
import { Types } from "mongoose";
import { UserSchema } from "./DB-Connector/loggin";

new DB({User : new UserSchema().model});

let logger = (req, res, next) =>{
    console.log(`at ${(new Date()).toString()}: ${req.protocol}://${req.get("host")}${req.originalUrl}: ${req.method} request`)
    next();
}; 
const app = express();
app.use(logger);



app.get('/member/:id', async ()=>{
    
});



const PORT = +process.env.PORT | 5000;
app.listen(PORT, ()=>{
    console.log(`lisening on ${PORT}`)
});