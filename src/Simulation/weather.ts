import { Simulator } from "./simulation";

const axios = require('axios');
export interface Location{
    lat : number;
    lon : number;
}
export class Weather{
    
    temp: number;
    speed: number;
    pos: Location;
    
    private static singleton: Weather;
    update: () => Promise<void>;

    constructor(pos: Location){
        this.temp = 0;
        this.speed = 0;
        this.pos = pos;
        this.update = async() => {
            try{
                const req = await axios.get(process.env.WEATHER_MODULE+`?lat=${this.pos.lat}&lon=${this.pos.lon}`);
                const data = req.data;
                this.temp = data.temp;
                this.speed = data.speed
            }catch (error){
                console.log(error);
            }
        }
        setImmediate(this.update, 3600000);//update every hour

    }
    static getInstance() : Weather {
        if(!Weather.singleton)
            Weather.singleton = Simulator.singelton.weather;
        return Weather.singleton;
    }
    
  
}
