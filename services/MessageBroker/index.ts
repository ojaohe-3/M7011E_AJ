import app from './app'
import { createServer } from "https";
import WebSocketHandler from './websockethandler';
import { Server } from 'http';

require('dotenv').config();


const PORT = process.env.PORT || 5000;

const fs = require('fs');
const credentials = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
};

app.set("port", PORT);
const server: Server = createServer(credentials, app)
const handler = new WebSocketHandler(server) //todo attach monitor

server.listen(app.get("port"), () => {
    console.log(`Server Listening on port ${PORT}`);
});

