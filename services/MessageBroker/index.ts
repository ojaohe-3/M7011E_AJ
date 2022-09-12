import app from './app'
import { createServer } from "https";
require('dotenv').config();



const fs = require('fs');
const credentials = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
};

const server = createServer(credentials, app)
const PORT =  process.env.PORT || 5000;
console.log("creating server on",PORT)
server.listen(PORT);

