import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";


import dotenv from "dotenv";
import Axios from "axios";
dotenv.config();
let number_updates = 0;
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

let logger = (req: Request, res : Response, next) => {
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


interface Cached {
    lat: number,
    lon: number,
    temp: number,
    speed: number,
    last_updated: number
}
let temp = 0;
let speed = 0;
let cach: Array<Cached> = [];
console.log(`default : lat: ${
    process.env.LAT
}, lon: ${
    process.env.LON
}`);
// setInterval(getWeather, 3600000);

let PORT = process.env.PORT || 5000;

app.get("/:lat/:lon", async (req, res) => { 
    
    const lat: number = + req.params.lat || +process.env.LAT;
    const lon: number = + req.params.lon || +process.env.LON;
    requests += 1;
    activiy();
    if (lat && lon) {
        const entry = cach.filter(e => e.lat === lat && e.lon === lon);
        if (entry.some(e => (Date.now() - e.last_updated < 36000000))) {
            res.json(entry[0]);
        } else { // no entry found
            res.json(await getWeather(lat, lon));
        }

    }else
        res.status(403).send("no location specified")
});

app.get("/monitor", (req, res) =>{
    res.json({
        number_updates,
        cach_size: cach.length,
        requests,
        activit_per_hour
    })
})

app.listen(PORT, function () {
    console.log(`App is listening on port ${PORT}`);
});

setInterval(activiy, 10 * 60 * 1000);
let activit_per_hour = 0;
let requests = 0;
let last_activiy = Date.now();
function activiy(){
    let hours = (Date.now() - last_activiy) / (3600*1000) // get Hours
    activit_per_hour = requests / hours;
}

async function getWeather(lat: number, lon: number) {
    try {
    console.log("update fetch")
    number_updates++;
    const res = await Axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WAPI}`);
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
