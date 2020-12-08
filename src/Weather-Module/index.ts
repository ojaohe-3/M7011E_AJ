import e = require("express");
import express = require("express");
const axios = require('axios');
require('dotenv').config();
import cors = require("cors");



const app: express.Application = express();

app.use(express.json());
app.use(cors());
declare interface IWeatherReport {
    coord: {
        lon: number,
        lat: number
    },
    weather: [
        {
            id: number,
            main: string,
            description: string,
            icon: string
        }
    ],
    base: string,
    main: {
        temp: number,
        feels_like: number,
        temp_min: number,
        temp_max: number,
        pressure: number,
        humidity: number
    },
    visibility: number,
    wind: {
        speed: number,
        deg: number
    },
    clouds: {
        all: number
    },
    dt: number,
    sys: {
        type: number,
        id: number,
        cuntry: String,
        sunrise: number,
        sunset: number
    },
    timezone: number,
    id: number,
    name: string,
    cod: number
}
interface cached {
    lat: number,
    lon: number,
    temp: number,
    speed: number,
    last_updated: number
}
let temp = 0;
let speed = 0;
let cach: Array<cached> = [];
console.log(`default : lat: ${
    process.env.LAT
}, lon: ${
    process.env.LAT
}`);
getWeather(+ process.env.LAT, + process.env.LON);
// setInterval(getWeather, 3600000);

let PORT = process.env.PORT || 5000;

app.get("/", async (req, res) => { // todo limit this, cache result
    const lat: number = + req.query.lat;
    const lon: number = + req.query.lon;
    if (lat && lon) {
        const entry = cach.filter(e => e.lat === lat && e.lon === lon);
        if (entry.some(e => (Date.now() - e.last_updated < 36000000))) {
            res.json(entry[0]);
        } else { // no entry found
            res.json(await getWeather(lat, lon));
        }

    }
    res.send("no location specified")
});
app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});


async function getWeather(lat: number, lon: number) {
    try {
    const res = await axios.get(`http:api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WAPI}`);
    // ({
    //     url: "api.openweathermap.org/data/2.5/weather",
    //     method:"GET",
    //     params:{
    //         lat: lat,
    //         lon: lon,
    //         appid: process.env.WAPI
    //     }
    // });
    const data = res.data;
    temp = data.main.temp;
    speed = data.wind.speed;
    const entry = cach.filter(e => e.lat === lat && e.lon === lon);
    if (entry.length > 0) 
        entry.map(v => {
            v.last_updated = Date.now();
            v.speed = speed;
            v.temp = temp;
        });
    else 
        cach.push({
            lat: lat,
            lon: lon,
            temp: temp,
            speed: speed,
            last_updated: Date.now()
        });
    
    return {
        lat: lat,
        lon: lon,
        temp: temp,
        speed: speed,
        last_updated: Date.now()
    };
    } catch (error) {
        console.log(error);
    }
    

}
