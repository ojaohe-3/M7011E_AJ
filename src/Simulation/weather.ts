const axios = require('axios');
export interface GeoLocation{
    lat : number;
    lon : number;
}
export class Weather{
    
    temp: number;
    speed: number;
    pos: GeoLocation;
    
    static singleton: Weather;
    constructor(pos: GeoLocation){
        this.temp = 270;
        this.speed = 7;
        this.pos = pos;
        Weather.update();
        setImmediate(Weather.update,3600000);//update every hour
        Weather.singleton = this;
    }
    
    static async update(){
        try{
            console.log(Weather.singleton.pos);
            const req = await axios.get(process.env.WEATHER_MODULE+`?lat=${this.pos.lat}&lon=${this.pos.lon}`);
            const data = req.data;
            Weather.singleton.temp = data.temp;
            Weather.singleton.speed = data.speed
        }catch (error){
            console.log(error);
        }
    }
}
