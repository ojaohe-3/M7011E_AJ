import express = require("express");
import {DB} from './DB-Connector/db-connector'
require('dotenv').config();
import cors = require("cors");


// todo create modules to clean this file
const app: express.Application = express();
app.use(express.json());
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


const consumer = require('./members/api_consumer');
const prosumer = require('./members/api_prosumer');
const manager = require('./members/api_manager');
const simdata = require('./members/api_collected_data');
const nodes = require('./members/api_nodes');

app.use(logger);
app.use(cors()); // vanurability, cross origin sharing, allows some xss

app.use('/api/members/consumers', consumer);
app.use('/api/members/prosumers', prosumer);
app.use('/api/members/managers', manager);
app.use('/api/data', simdata);
app.use('/api/nodes', nodes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});


