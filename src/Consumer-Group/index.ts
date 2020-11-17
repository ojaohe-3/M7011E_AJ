//todo
// respond to api calls and
// send updated databatches every tick

import express = require("express");

const app: express.Application = express();

app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.listen(5000, function () {
    console.log("App is listening on port 5000!");
});