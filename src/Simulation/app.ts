import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";


const dotenv = require("dotenv");
dotenv.config();

declare interface ResponseError extends Error {
  status?: number
}

const app : Application = express();

const options: cors.CorsOptions = {
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

app.use(cors(options));


app.use(express.json());
app.use(express.urlencoded({
  extended: false
}))

let logger = (req, res, next) => {
    console.log(`at ${
        (new Date()).toString()
    }: ${
        req.protocol
    }://${
        req.get("host")
    }${
        req.originalUrl
    }: ${
        req.method
    } request`)
    next();
};
// todo authentication middleware
app.use(logger);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*") //TODO
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  res.set('Content-Type', 'application/json')
  next()
})

app.use((err: ResponseError, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    res.status(err.status || 500);
    res.send("Error Occured!\nPlease try again later");
  })


const consumer = require('./members/api_consumer');
const prosumer = require('./members/api_prosumer');
const manager = require('./members/api_manager');
const simdata = require('./members/api_collected_data');
const nodes = require('./members/api_nodes');
const manager_control = require('./control/manager-api-control');
const prosumer_control = require('./control/prosumer-api-control');

app.use('/api/members/consumers', consumer);
app.use('/api/members/prosumers', prosumer);
app.use('/api/members/managers', manager);
app.use('/api/data', simdata);
app.use('/api/nodes', nodes);
app.use('/api/control/manager', manager_control);
app.use('/api/control/prosumer', prosumer_control);

// const port = process.env.PORT || 5000;
// app.set("port", port);



export default app;
