import express = require("express");
import swig = require("swig");

const path = require('path');
const app = express();
swig.init({root: __dirname + '/Interfaces'})
app.engine('html', swig.renderFile);
app.use(express.static('css'));
app.use(express.static('js'));
app.use(express.static('img'));
app.use(express.static('fonts'));

app.get("/", function(req, resp) {
    console.log(path.resolve('prosumer.html'));
    resp.render(path.resolve('src', 'Interfaces', 'page', 'prosumer.html'), {production: 333, battery: 85, elecPrice: 1.9, consumption: 356, ratio: 70, marketConsumption: 0});

});

const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
    console.log(`App is listening to port ${PORT}`);
});

