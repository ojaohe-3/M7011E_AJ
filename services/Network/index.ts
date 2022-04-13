import app from './app'
import { createServer } from "https";
require('dotenv').config();



const fs = require('fs');
const credentials = {
    key: fs.readFileSync('net.key'),
    cert: fs.readFileSync('net.crt'),
};

const server = createServer(credentials, app)
const PORT =  process.env.PORT || 5000;
server.listen(PORT);

