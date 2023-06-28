import app from "./app";
import dotenv from "dotenv";
import { createServer } from "https";
import { DB } from "./DB-Connector/db-connector";
dotenv.config();

const PORT = process.env.PORT || 5000;


// app.listen(PORT, () => {
//     console.log(`App is listening on port ${PORT}`);
// });

const fs = require('fs')

const credentials = {
    key: fs.readFileSync('sim.key'),
    cert: fs.readFileSync('sim.crt'),
};
console.log("creating server on",PORT)

const server = createServer(credentials, app);
server.listen(PORT);
DB.Instance;