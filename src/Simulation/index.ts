import app from "./app";


const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 5000;


app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});